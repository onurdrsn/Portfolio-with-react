import { createMiddleware } from "hono/factory";
import { SignJWT, jwtVerify } from "jose";
import { getCookie } from "hono/cookie";

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  JWT_EXPIRATION_TIME?: string;
  REFRESH_TOKEN_EXPIRATION_TIME?: string;
  AI: any;
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
  secret: string,
  expiresIn: string = "7d"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret(secret));
}

export async function signRefreshToken(
  payload: { sub: string; isAdmin: boolean },
  secret: string,
  expiresIn: string = "30d"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
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

function getTokenFromContext(c: any): string | null {
  let token = getCookie(c, "token");
  if (token) return token;
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

// Middleware: Require authenticated user
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const token = getTokenFromContext(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
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
  const token = getTokenFromContext(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
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
  const token = getTokenFromContext(c);
  if (token) {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (payload) {
      c.set("userId", payload.sub);
      c.set("isAdmin", payload.isAdmin);
    }
  }
  await next();
});
