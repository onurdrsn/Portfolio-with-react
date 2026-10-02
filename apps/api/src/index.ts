import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/auth";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import { aiRouter } from "./routes/ai";
import { gameRoomRouter } from "./routes/gameRoom";
import { contactRouter } from "./routes/contact";
import { registerPortfolioRoutes } from "./routes/portfolio";
import { registerTimelineRoutes } from "./routes/timeline";
import { registerSettingsRoutes } from "./routes/settings";
import type { Env, Variables } from "./middleware/auth";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS — allow frontend origin
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // Build allowed list from env + hardcoded safe origins
      const frontendUrl = c.env?.FRONTEND_URL || "https://onurd.com.tr";
      const allowed = [
        frontendUrl,
        // www variant
        frontendUrl.replace("://", "://www."),
        // Worker self (for internal calls)
        "https://portfolio-worker.onurd.com.tr",
        // Local dev
        "http://localhost:5173",
        "http://localhost:4173",
      ].filter(Boolean);

      if (!origin) {
        // No Origin header → non-browser / same-origin request, allow
        return null;
      }

      if (allowed.includes(origin)) {
        return origin;
      }

      // Unknown origin → block (return null = no CORS header = browser blocks)
      return null;
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
app.route("/api/contact", contactRouter);
app.route("/api/ai", aiRouter);
app.route("/api/game", gameRoomRouter);

// Directly register portfolio, timeline & settings routes on main app
registerPortfolioRoutes(app);
registerTimelineRoutes(app);
registerSettingsRoutes(app);

// Health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// 404
app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
