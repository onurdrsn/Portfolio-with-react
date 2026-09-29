import { Hono } from "hono";
// @ts-ignore
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { siteSettings } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Env, Variables } from "../middleware/auth";

async function ensureSettingsTable(db: any) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
}

export function registerSettingsRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // GET /api/settings
  const getSettings = async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    try {
      const items = await db.select().from(siteSettings);
      const settingsMap: Record<string, string> = { uiVersion: "v1" };
      for (const item of items) {
        settingsMap[item.key] = item.value;
      }
      return c.json(settingsMap);
    } catch {
      await ensureSettingsTable(db);
      return c.json({ uiVersion: "v1" });
    }
  };

  app.get("/api/settings", getSettings);
  app.get("/api/settings/", getSettings);

  // PUT /api/settings
  app.put("/api/settings", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const { uiVersion, ...otherSettings } = body;

    if (uiVersion && !["v1", "v2", "v3", "v4"].includes(uiVersion)) {
      return c.json({ error: "Invalid uiVersion. Must be 'v1', 'v2', 'v3', or 'v4'" }, 400);
    }

    try {
      if (uiVersion) {
        await db
          .insert(siteSettings)
          .values({ key: "uiVersion", value: uiVersion, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: uiVersion, updatedAt: new Date() },
          });
      }
      for (const [key, val] of Object.entries(otherSettings)) {
        if (typeof val === "string") {
          await db
            .insert(siteSettings)
            .values({ key, value: val, updatedAt: new Date() })
            .onConflictDoUpdate({
              target: siteSettings.key,
              set: { value: val, updatedAt: new Date() },
            });
        }
      }
      return c.json({ success: true, uiVersion: uiVersion || "v1" });
    } catch {
      await ensureSettingsTable(db);
      if (uiVersion) {
        await db
          .insert(siteSettings)
          .values({ key: "uiVersion", value: uiVersion, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: uiVersion, updatedAt: new Date() },
          });
      }
      return c.json({ success: true, uiVersion: uiVersion || "v1" });
    }
  });
}
