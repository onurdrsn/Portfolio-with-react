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
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
        username text NOT NULL UNIQUE,
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL DEFAULT '',
        temp_code text,
        temp_code_expires_at timestamp,
        passcode_resend_count integer NOT NULL DEFAULT 0,
        last_passcode_sent_at timestamp,
        is_admin boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_code text;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_code_expires_at timestamp;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS passcode_resend_count integer NOT NULL DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_passcode_sent_at timestamp;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamp;`);
  } catch (e) {
    console.error("[Auth] ensureUsersTable error:", e);
  }
}

// ─── Rate Limiter (IP-based sliding window) ──────────────────────────────
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = rateLimits.get(key);
  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  record.count++;
  return { allowed: true, retryAfter: 0 };
}

export function clearRateLimits() {
  rateLimits.clear();
}

// ─── 1. Send Temporary Password (OTP) via Resend ────────────────────────
const handleSendPasscode = async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  await ensureUsersTable(db);

  // Rate limit: max 5 requests per 2 minutes per IP
  const clientIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "local";
  const ipLimit = checkRateLimit(`send_passcode_${clientIp}`, 5, 2 * 60 * 1000);
  if (!ipLimit.allowed) {
    return c.json(
      {
        error: `Çok fazla kod gönderme talebi yapıldı. Lütfen ${ipLimit.retryAfter} saniye bekleyiniz.`,
        retryAfter: ipLimit.retryAfter,
      },
      429
    );
  }

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
  let resendCount = 0;
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers.length > 0) {
    user = existingUsers[0];

    // Check if account is currently locked due to 5 failed passcode attempts
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const remainingSec = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
      return c.json(
        {
          error: `Hesabınız 5 kez hatalı şifre girildiği için kilitlenmiştir. Yeni şifre talep edemezsiniz. Kalan süre: ${Math.floor(remainingSec / 60)} dakika ${remainingSec % 60} saniye.`,
          locked: true,
          lockedUntil: user.lockedUntil,
          remainingSec,
        },
        423
      );
    }

    // Check exponential backoff rate limit (starts at 30s, doubles each time: 30s, 60s, 120s...)
    if (user.lastPasscodeSentAt) {
      const lastSentTime = new Date(user.lastPasscodeSentAt).getTime();
      const elapsedSec = Math.floor((Date.now() - lastSentTime) / 1000);

      // Reset resend count if more than 10 minutes (600s) have passed
      let currentCount = user.passcodeResendCount || 0;
      if (elapsedSec > 600) {
        currentCount = 0;
      }

      const cooldownSec = Math.min(30 * Math.pow(2, currentCount), 3600);

      if (elapsedSec < cooldownSec) {
        const remainingSec = cooldownSec - elapsedSec;
        return c.json(
          {
            error: `Yeni parola istemek için lütfen ${remainingSec} saniye bekleyiniz.`,
            retryAfter: remainingSec,
          },
          429
        );
      }
      resendCount = currentCount;
    }
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
      passcodeResendCount: resendCount + 1,
      lastPasscodeSentAt: new Date(),
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

  if (!emailResult.success) {
    console.error("[Auth] E-posta gönderimi başarısız:", emailResult.error);
    return c.json(
      {
        error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyiniz.",
      },
      500
    );
  }

  return c.json({
    success: true,
    message: "Geçici parolanız e-posta adresinize gönderildi! Lütfen 10 dakika içinde giriniz.",
    email: user.email,
    username: user.username,
  });
};

authRouter.post("/send-passcode", handleSendPasscode);
authRouter.post("/request-otp", handleSendPasscode);

// ─── 2. Verify Temporary Password & Log In ──────────────────────────────
const handleLoginPasscode = async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  await ensureUsersTable(db);

  // Rate limit: max 10 requests per minute per IP
  const clientIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "local";
  const ipLimit = checkRateLimit(`login_passcode_${clientIp}`, 10, 60 * 1000);
  if (!ipLimit.allowed) {
    return c.json(
      {
        error: `Çok fazla şifre denemesi yapıldı. Lütfen ${ipLimit.retryAfter} saniye bekleyiniz.`,
        retryAfter: ipLimit.retryAfter,
      },
      429
    );
  }

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

  // 1. Check if account is locked due to 5 failed attempts
  if (user.lockedUntil) {
    const lockTime = new Date(user.lockedUntil).getTime();
    if (Date.now() < lockTime) {
      const remainingSec = Math.ceil((lockTime - Date.now()) / 1000);
      const remainingMins = Math.floor(remainingSec / 60);
      const remainingSecondsOnly = remainingSec % 60;
      return c.json(
        {
          error: `5 kez hatalı şifre girdiğiniz için hesabınız kilitlendi. Lütfen bekleyiniz (${remainingMins} dk ${remainingSecondsOnly} sn).`,
          locked: true,
          lockedUntil: user.lockedUntil,
          remainingSec,
          remainingAttempts: 0,
        },
        423
      );
    } else {
      // Lock period expired, reset failed attempts
      await db
        .update(users)
        .set({ failedAttempts: 0, lockedUntil: null })
        .where(eq(users.id, user.id));
      user.failedAttempts = 0;
      user.lockedUntil = null;
    }
  }

  // 2. Check if matching OTP code
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
    const newAttempts = (user.failedAttempts || 0) + 1;
    const MAX_ATTEMPTS = 5;

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockDurationMs = 15 * 60 * 1000; // 15 minutes lockout
      const lockedUntil = new Date(Date.now() + lockDurationMs);

      await db
        .update(users)
        .set({
          failedAttempts: MAX_ATTEMPTS,
          lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return c.json(
        {
          error: "5 kez hatalı şifre girdiniz! Güvenlik sebebiyle şifre girme kilitlendi. 15 dakika boyunca hiçbir işlem yapamazsınız.",
          locked: true,
          lockedUntil: lockedUntil.toISOString(),
          remainingSec: 15 * 60,
          remainingAttempts: 0,
          failedAttempts: MAX_ATTEMPTS,
        },
        423
      );
    } else {
      await db
        .update(users)
        .set({
          failedAttempts: newAttempts,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      const remaining = MAX_ATTEMPTS - newAttempts;
      return c.json(
        {
          error: `Girdiğiniz parola geçersiz veya hatalı. Kalan deneme hakkınız: ${remaining}`,
          failedAttempts: newAttempts,
          remainingAttempts: remaining,
          locked: false,
        },
        401
      );
    }
  }

  // 3. Successful login: Invalidate temporary password, reset failed attempts & lockout
  await db
    .update(users)
    .set({
      tempCode: null,
      tempCodeExpiresAt: null,
      passcodeResendCount: 0,
      failedAttempts: 0,
      lockedUntil: null,
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
