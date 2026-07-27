import { Hono } from "hono";
// @ts-ignore
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { getDb } from "../db";
import { users } from "../db/schema";
import { signToken, signRefreshToken, verifyToken } from "../middleware/auth";
import type { Env } from "../middleware/auth";

export const authRouter = new Hono<{ Bindings: Env }>();

const COOKIE_OPTIONS = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "None" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// POST /api/auth/register
authRouter.post("/register", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { username, email, password } = await c.req.json();

  if (!username || !email || !password) {
    return c.json({ error: "Username, email and password are required" }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters" }, 400);
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const existingUsername = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existingUsername.length > 0) {
    return c.json({ error: "Username already taken" }, 409);
  }

  const passwordHash = await hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ username, email, passwordHash, isAdmin: false })
    .returning();

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
  }, 201);
});

// POST /api/auth/login
authRouter.post("/login", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

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
});

// POST /api/auth/logout
authRouter.post("/logout", async (c) => {
  deleteCookie(c, "token", { path: "/", secure: true, sameSite: "None" });
  return c.json({ success: true });
});

// GET /api/auth/me  (requires auth via HttpOnly cookie or Authorization header)
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
