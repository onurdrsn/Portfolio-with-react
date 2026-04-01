import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/auth";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import type { Env } from "./middleware/auth";

const app = new Hono<{ Bindings: Env }>();

// CORS — allow frontend origin
app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      const allowed = [
        c.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:4173",
      ];
      return allowed.includes(origin) ? origin : allowed[0];
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.route("/api/auth", authRouter);
app.route("/api/posts", postsRouter);
app.route("/api/comments", commentsRouter);

// Health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// 404
app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
