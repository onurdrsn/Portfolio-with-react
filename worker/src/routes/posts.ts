import { Hono } from "hono";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import { posts, users } from "../db/schema";
import { requireAdmin, optionalAuth } from "../middleware/auth";
import type { Env, Variables } from "../middleware/auth";

export const postsRouter = new Hono<{
  Bindings: Env;
  Variables: Partial<Variables>;
}>();

// Helper: generate slug from title
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/posts — list published posts (paginated)
postsRouter.get("/", optionalAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const isAdmin = c.get("isAdmin") ?? false;
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "10");
  const offset = (page - 1) * limit;
  const tag = c.req.query("tag");

  // Admin sees all, public sees only published
  const conditions = isAdmin ? [] : [eq(posts.published, true)];
  if (tag) {
    conditions.push(sql`${posts.tags} @> ARRAY[${tag}]::text[]`);
  }

  const query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      published: posts.published,
      tags: posts.tags,
      createdAt: posts.createdAt,
      author: {
        id: users.id,
        username: users.username,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    // @ts-ignore
    const results = await query.where(and(...conditions));
    return c.json({ posts: results, page, limit });
  }

  const results = await query;
  return c.json({ posts: results, page, limit });
});

// GET /api/posts/:slug — single post
postsRouter.get("/:slug", optionalAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const isAdmin = c.get("isAdmin") ?? false;
  const { slug } = c.req.param();

  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      published: posts.published,
      tags: posts.tags,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: users.id,
        username: users.username,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post) return c.json({ error: "Post not found" }, 404);
  if (!post.published && !isAdmin) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json(post);
});

// POST /api/posts — create post (admin only)
postsRouter.post("/", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.get("userId")!;
  const body = await c.req.json();
  const { title, content, excerpt, coverImage, published, tags } = body;

  if (!title || !content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  let slug = slugify(title);
  // Ensure unique slug
  const existing = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      coverImage: coverImage ?? null,
      published: published ?? false,
      tags: tags ?? [],
      authorId: userId,
    })
    .returning();

  return c.json(post, 201);
});

// PUT /api/posts/:id — update post (admin only)
postsRouter.put("/:id", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  const body = await c.req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (body.title !== undefined) {
    updateData.title = body.title;
    updateData.slug = slugify(body.title);
  }
  if (body.content !== undefined) updateData.content = body.content;
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
  if (body.published !== undefined) updateData.published = body.published;
  if (body.tags !== undefined) updateData.tags = body.tags;

  const [updated] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  if (!updated) return c.json({ error: "Post not found" }, 404);
  return c.json(updated);
});

// DELETE /api/posts/:id — delete post (admin only)
postsRouter.delete("/:id", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  const [deleted] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ id: posts.id });
  if (!deleted) return c.json({ error: "Post not found" }, 404);
  return c.json({ success: true });
});
