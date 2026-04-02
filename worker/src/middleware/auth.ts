import { createMiddleware } from "hono/factory";
import { SignJWT, jwtVerify } from "jose";

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
};

export type Variables = {
  userId: string;
  isAdmin: boolean;
};

export function getJwtSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: { sub: string; isAdmin: boolean },
  secret: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // jwt 7 days expiry
    .sign(getJwtSecret(secret));
}

export async function signRefreshToken(
  payload: { sub: string; isAdmin: boolean },
  secret: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // refresh token expiry
    .sign(getJwtSecret(secret));
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<{ sub: string; isAdmin: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(secret));
    return payload as { sub: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

// Middleware: Require authenticated user
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }
  c.set("userId", payload.sub);
  c.set("isAdmin", payload.isAdmin);
  await next();
});

// Middleware: Require admin role
export const requireAdmin = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }
  if (!payload.isAdmin) {
    return c.json({ error: "Forbidden" }, 403);
  }
  c.set("userId", payload.sub);
  c.set("isAdmin", payload.isAdmin);
  await next();
});

// Optional auth — attaches user if token present, doesn't block
export const optionalAuth = createMiddleware<{
  Bindings: Env;
  Variables: Partial<Variables>;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (payload) {
      c.set("userId", payload.sub);
      c.set("isAdmin", payload.isAdmin);
    }
  }
  await next();
});
