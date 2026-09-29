import { Hono } from "hono";
// @ts-ignore
import { eq, sql } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { getDb } from "../db";
import { users } from "../db/schema";
import { signToken, signRefreshToken, verifyToken } from "../middleware/auth";
import { sendEmail, generateOtpEmailHtml } from "../lib/email";
import type { Env } from "../middleware/auth";

export const authRouter = new Hono<{ Bindings: Env }>();

const COOKIE_OPTIONS = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "None" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

async function ensureUsersTable(db: any) {
  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_code text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_code_expires_at timestamp;
    `);
  } catch (e) {
    console.error("[Auth] ensureUsersTable error:", e);
  }
}

// ─── 1. Send Temporary Password (OTP) via Resend ────────────────────────
const handleSendPasscode = async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  await ensureUsersTable(db);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const email = (body.email || "").trim().toLowerCase();
  const requestedUsername = (body.username || "").trim();

  if (!email) {
    return c.json({ error: "Lütfen e-posta adresinizi giriniz." }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "Geçerli bir e-posta adresi giriniz." }, 400);
  }

  // Find or create user
  let user: any = null;
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers.length > 0) {
    user = existingUsers[0];
  } else {
    // Automatically create a new user account with default username from email
    const baseUsername = requestedUsername || email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
    let finalUsername = baseUsername;
    
    // Check if username taken
    const existingName = await db
      .select()
      .from(users)
      .where(eq(users.username, finalUsername))
      .limit(1);
    if (existingName.length > 0) {
      finalUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    try {
      const [newUser] = await db
        .insert(users)
        .values({
          username: finalUsername,
          email,
          passwordHash: "",
          isAdmin: false,
        })
        .returning();
      user = newUser;
    } catch {
      const [retryUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      user = retryUser;
    }
  }

  if (!user) {
    return c.json({ error: "Kullanıcı hesabı oluşturulamadı." }, 500);
  }

  // Generate 6-digit numeric temporary passcode
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Valid for 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db
    .update(users)
    .set({
      tempCode: code,
      tempCodeExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Send Email via Resend
  const emailHtml = generateOtpEmailHtml(user.username, code);
  const textContent = `Sistemimize Hoş Geldiniz ${user.username},\n\nParolanız: ${code}\n\n* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.`;

  const emailResult = await sendEmail(
    {
      to: user.email,
      subject: `🔐 Giriş Parolanız: ${code} — Onur Dursun Portfolio`,
      html: emailHtml,
      text: textContent,
    },
    c.env,
    db
  );

  return c.json({
    success: true,
    message: "Geçici parolanız e-posta adresinize gönderildi! Lütfen 10 dakika içinde giriniz.",
    email: user.email,
    username: user.username,
    emailSent: emailResult.success,
    // If no email key is configured in dev, provide debug code so developers aren't locked out
    ...(!emailResult.success && !c.env.RESEND_API_KEY ? { devCode: code } : {}),
  });
};

authRouter.post("/send-passcode", handleSendPasscode);
authRouter.post("/request-otp", handleSendPasscode);

// ─── 2. Verify Temporary Password & Log In ──────────────────────────────
const handleLoginPasscode = async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  await ensureUsersTable(db);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || body.password || "").trim();

  if (!email || !code) {
    return c.json({ error: "E-posta ve geçici parola gereklidir." }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return c.json({ error: "Bu e-posta adresine ait bir kullanıcı bulunamadı." }, 404);
  }

  // 1. Check if matching OTP code
  let isValid = false;
  if (user.tempCode && user.tempCode.trim() === code) {
    if (user.tempCodeExpiresAt && new Date() > new Date(user.tempCodeExpiresAt)) {
      return c.json({ error: "Parolanın 10 dakikalık geçerlilik süresi dolmuş. Lütfen yeni bir parola isteyin." }, 401);
    }
    isValid = true;
  } else if (user.passwordHash && user.passwordHash.length > 5) {
    // Fallback: check legacy password hash if user has one
    isValid = await compare(code, user.passwordHash);
  }

  if (!isValid) {
    return c.json({ error: "Girdiğiniz parola geçersiz veya hatalı. Lütfen e-postanızı kontrol edin." }, 401);
  }

  // Invalidate the temporary password immediately upon successful login
  await db
    .update(users)
    .set({
      tempCode: null,
      tempCodeExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const jwtExpiry = c.env.JWT_EXPIRATION_TIME || "7d";
  const token = await signToken({ sub: user.id, isAdmin: user.isAdmin }, c.env.JWT_SECRET, jwtExpiry);

  // Set HttpOnly Cookie
  setCookie(c, "token", token, COOKIE_OPTIONS);

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
};

authRouter.post("/login-passcode", handleLoginPasscode);
authRouter.post("/verify-otp", handleLoginPasscode);
authRouter.post("/login", handleLoginPasscode); // Backward-compatible route

// ─── 3. Register route (Redirects to passwordless flow) ───────────────────
authRouter.post("/register", async (c) => {
  return handleSendPasscode(c);
});

// ─── 4. Logout ───────────────────────────────────────────────────────────
authRouter.post("/logout", async (c) => {
  deleteCookie(c, "token", { path: "/", secure: true, sameSite: "None" });
  return c.json({ success: true });
});

// ─── 5. Current User Info ────────────────────────────────────────────────
authRouter.get("/me", async (c) => {
  let token = getCookie(c, "token");
  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const db = getDb(c.env.DATABASE_URL);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});
