import { eq, asc, sql, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { timelineItems } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Hono } from "hono";
import type { Env, Variables } from "../middleware/auth";

async function ensureTimelineTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS timeline_items (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      year text NOT NULL,
      company text NOT NULL,
      title text NOT NULL,
      duration text NOT NULL DEFAULT '',
      details text[] NOT NULL DEFAULT '{}',
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);
}

export function registerTimelineRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // GET /api/timeline
  const getTimeline = async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    try {
      const items = await db
        .select()
        .from(timelineItems)
        .orderBy(asc(timelineItems.displayOrder));
      return c.json(items);
    } catch {
      await ensureTimelineTable(db);
      return c.json([]);
    }
  };
  app.get("/api/timeline", getTimeline);
  app.get("/api/timeline/", getTimeline);

  // POST /api/timeline
  const createTimeline = async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const { year, company, title, duration, details, displayOrder } = body;

    if (!year || !company || !title) {
      return c.json({ error: "Year, company, and title are required" }, 400);
    }

    const payload = {
      year,
      company,
      title,
      duration: duration || "",
      details: details || [],
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    };

    try {
      const [inserted] = await db.insert(timelineItems).values(payload).returning();
      return c.json(inserted, 201);
    } catch {
      await ensureTimelineTable(db);
      const [inserted] = await db.insert(timelineItems).values(payload).returning();
      return c.json(inserted, 201);
    }
  };
  app.post("/api/timeline", requireAdmin, createTimeline);
  app.post("/api/timeline/", requireAdmin, createTimeline);

  // POST /api/timeline/bulk-seed
  app.post("/api/timeline/bulk-seed", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: "No items provided for seeding" }, 400);
    }

    const values = items.map((item: any, idx: number) => ({
      year: item.year,
      company: item.company,
      title: item.title,
      duration: item.duration || "",
      details: Array.isArray(item.details) ? item.details : [item.details].filter(Boolean),
      displayOrder: idx,
    }));

    try {
      const inserted = await db.insert(timelineItems).values(values).returning();
      return c.json(inserted, 201);
    } catch {
      await ensureTimelineTable(db);
      const inserted = await db.insert(timelineItems).values(values).returning();
      return c.json(inserted, 201);
    }
  });

  // POST /api/timeline/bulk-delete
  app.post("/api/timeline/bulk-delete", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const ids = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "No ids provided for deletion" }, 400);
    }

    try {
      await db.delete(timelineItems).where(inArray(timelineItems.id, ids));
      return c.json({ success: true, count: ids.length });
    } catch {
      await ensureTimelineTable(db);
      await db.delete(timelineItems).where(inArray(timelineItems.id, ids));
      return c.json({ success: true, count: ids.length });
    }
  });

  // PUT /api/timeline/:id
  app.put("/api/timeline/:id", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const { id } = c.req.param();
    const body = await c.req.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.year !== undefined) updateData.year = body.year;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    try {
      const [updated] = await db
        .update(timelineItems)
        .set(updateData)
        .where(eq(timelineItems.id, id))
        .returning();

      if (!updated) return c.json({ error: "Timeline item not found" }, 404);
      return c.json(updated);
    } catch {
      await ensureTimelineTable(db);
      return c.json({ error: "Timeline item not found" }, 404);
    }
  });

  // DELETE /api/timeline/:id
  app.delete("/api/timeline/:id", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const { id } = c.req.param();
    try {
      const [deleted] = await db
        .delete(timelineItems)
        .where(eq(timelineItems.id, id))
        .returning({ id: timelineItems.id });

      if (!deleted) return c.json({ error: "Timeline item not found" }, 404);
      return c.json({ success: true });
    } catch {
      await ensureTimelineTable(db);
      return c.json({ error: "Timeline item not found" }, 404);
    }
  });
}
