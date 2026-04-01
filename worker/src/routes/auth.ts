import { Hono } from "hono";
// @ts-ignore
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { getDb } from "../db";
import { users } from "../db/schema";
import { signToken } from "../middleware/auth";
import type { Env } from "../middleware/auth";

export const authRouter = new Hono<{ Bindings: Env }>();

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

  // Check existing
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

  const token = await signToken(
    { sub: user.id, isAdmin: user.isAdmin },
    c.env.JWT_SECRET || "default_local_dev_secret_xyz123"
  );

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

  const token = await signToken(
    { sub: user.id, isAdmin: user.isAdmin },
    c.env.JWT_SECRET || "default_local_dev_secret_xyz123"
  );

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

// GET /api/auth/me  (requires auth)
authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { verifyToken } = await import("../middleware/auth");
  const payload = await verifyToken(
    authHeader.slice(7),
    c.env.JWT_SECRET || "default_local_dev_secret_xyz123"
  );
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
