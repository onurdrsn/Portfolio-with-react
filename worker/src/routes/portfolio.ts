import { eq, asc, sql, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { portfolioItems } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Hono } from "hono";
import type { Env, Variables } from "../middleware/auth";

async function ensurePortfolioTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      img_url text NOT NULL DEFAULT '',
      stack text[] NOT NULL DEFAULT '{}',
      link text DEFAULT '',
      github text DEFAULT '',
      description text NOT NULL,
      category text NOT NULL DEFAULT 'Full Stack',
      featured boolean NOT NULL DEFAULT false,
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);
}

function toBoolean(val: any): boolean {
  if (val === true || val === 1 || val === "1") return true;
  if (typeof val === "string") {
    const s = val.toLowerCase().trim();
    return s === "true" || s === "t" || s === "yes";
  }
  return false;
}

export function registerPortfolioRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  // GET /api/portfolio
  const getPortfolio = async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    try {
      const items = await db
        .select()
        .from(portfolioItems)
        .orderBy(asc(portfolioItems.displayOrder));
      return c.json(items);
    } catch {
      await ensurePortfolioTable(db);
      return c.json([]);
    }
  };
  app.get("/api/portfolio", getPortfolio);
  app.get("/api/portfolio/", getPortfolio);

  // POST /api/portfolio
  const createPortfolio = async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const { title, imgUrl, stack, link, github, description, category, featured, displayOrder } = body;

    if (!title || !description) {
      return c.json({ error: "Title and description are required" }, 400);
    }

    const payload = {
      title,
      imgUrl: imgUrl || "",
      stack: stack || [],
      link: link || "",
      github: github || "",
      description,
      category: category || "Full Stack",
      featured: toBoolean(featured),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    };

    try {
      const [inserted] = await db.insert(portfolioItems).values(payload).returning();
      return c.json(inserted, 201);
    } catch {
      await ensurePortfolioTable(db);
      const [inserted] = await db.insert(portfolioItems).values(payload).returning();
      return c.json(inserted, 201);
    }
  };
  app.post("/api/portfolio", requireAdmin, createPortfolio);
  app.post("/api/portfolio/", requireAdmin, createPortfolio);

  // POST /api/portfolio/bulk-seed
  app.post("/api/portfolio/bulk-seed", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: "No items provided for seeding" }, 400);
    }

    const values = items.map((item: any, idx: number) => ({
      title: item.title,
      imgUrl: item.imgUrl || "",
      stack: item.stack || [],
      link: item.link || "",
      github: item.github || "",
      description: item.description || "",
      category: item.category || "Full Stack",
      featured: toBoolean(item.featured),
      displayOrder: idx,
    }));

    try {
      const inserted = await db.insert(portfolioItems).values(values).returning();
      return c.json(inserted, 201);
    } catch {
      await ensurePortfolioTable(db);
      const inserted = await db.insert(portfolioItems).values(values).returning();
      return c.json(inserted, 201);
    }
  });

  // PUT /api/portfolio/:id
  app.put("/api/portfolio/:id", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const { id } = c.req.param();
    const body = await c.req.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.imgUrl !== undefined) updateData.imgUrl = body.imgUrl;
    if (body.stack !== undefined) updateData.stack = body.stack;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.github !== undefined) updateData.github = body.github;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.featured !== undefined) updateData.featured = toBoolean(body.featured);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    try {
      const [updated] = await db
        .update(portfolioItems)
        .set(updateData)
        .where(eq(portfolioItems.id, id))
        .returning();

      if (!updated) return c.json({ error: "Portfolio item not found" }, 404);
      return c.json(updated);
    } catch {
      await ensurePortfolioTable(db);
      return c.json({ error: "Portfolio item not found" }, 404);
    }
  });

  // POST /api/portfolio/bulk-delete
  app.post("/api/portfolio/bulk-delete", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const ids = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "No ids provided for deletion" }, 400);
    }

    try {
      await db.delete(portfolioItems).where(inArray(portfolioItems.id, ids));
      return c.json({ success: true, count: ids.length });
    } catch {
      await ensurePortfolioTable(db);
      await db.delete(portfolioItems).where(inArray(portfolioItems.id, ids));
      return c.json({ success: true, count: ids.length });
    }
  });

  // DELETE /api/portfolio/:id
  app.delete("/api/portfolio/:id", requireAdmin, async (c: any) => {
    const db = getDb(c.env.DATABASE_URL);
    const { id } = c.req.param();
    try {
      const [deleted] = await db
        .delete(portfolioItems)
        .where(eq(portfolioItems.id, id))
        .returning({ id: portfolioItems.id });

      if (!deleted) return c.json({ error: "Portfolio item not found" }, 404);
      return c.json({ success: true });
    } catch {
      await ensurePortfolioTable(db);
      return c.json({ error: "Portfolio item not found" }, 404);
    }
  });
}
