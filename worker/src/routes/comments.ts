import { Hono } from "hono";
import { eq, and, desc, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { comments, posts, users } from "../db/schema";
import { requireAdmin, optionalAuth } from "../middleware/auth";
import type { Env, Variables } from "../middleware/auth";

export const commentsRouter = new Hono<{
  Bindings: Env;
  Variables: Partial<Variables>;
}>();

// GET /api/comments/:postId — list approved comments for a post (with replies)
commentsRouter.get("/:postId", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { postId } = c.req.param();

  const results = await db
    .select({
      id: comments.id,
      authorName: comments.authorName,
      content: comments.content,
      createdAt: comments.createdAt,
      userId: comments.userId,
      parentId: comments.parentId,
    })
    .from(comments)
    .where(
      and(
        eq(comments.postId, postId),
        eq(comments.approved, true)
      )
    )
    .orderBy(desc(comments.createdAt));

  return c.json(results);
});

// POST /api/comments/:postId — submit a comment (with optional parentId for replies)
commentsRouter.post("/:postId", optionalAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { postId } = c.req.param();
  const userId = c.get("userId");
  const body = await c.req.json();
  const { authorName, authorEmail, content, parentId } = body;

  if (!content || content.trim().length === 0) {
    return c.json({ error: "Comment content is required" }, 400);
  }

  // Check post exists and is published
  const [post] = await db
    .select({ id: posts.id, published: posts.published })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post || !post.published) {
    return c.json({ error: "Post not found" }, 404);
  }

  // Validate parentId if provided (must exist and belong to same post)
  if (parentId) {
    const [parent] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.id, parentId), eq(comments.postId, postId)))
      .limit(1);
    if (!parent) {
      return c.json({ error: "Parent comment not found" }, 404);
    }
  }

  let name = authorName;
  let email = authorEmail;
  let autoApproved = false;

  if (userId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user) {
      name = user.username;
      email = user.email;
      autoApproved = true;
    }
  } else {
    if (!name || !email) {
      return c.json(
        { error: "Name and email are required for anonymous comments" },
        400
      );
    }
  }

  const [comment] = await db
    .insert(comments)
    .values({
      postId,
      userId: userId ?? null,
      parentId: parentId ?? null,
      authorName: name,
      authorEmail: email,
      content: content.trim(),
      approved: autoApproved,
    })
    .returning();

  return c.json(
    {
      comment,
      message: autoApproved
        ? "Yorumunuz başarıyla paylaşıldı."
        : "Admin onayı bekleniyor.",
    },
    201
  );
});

// PATCH /api/comments/:id/approve — approve comment (admin only)
commentsRouter.patch("/:id/approve", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  const [updated] = await db
    .update(comments)
    .set({ approved: true })
    .where(eq(comments.id, id))
    .returning({ id: comments.id });
  if (!updated) return c.json({ error: "Comment not found" }, 404);
  return c.json({ success: true });
});

// DELETE /api/comments/:id — delete comment (admin only)
commentsRouter.delete("/:id", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  const [deleted] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ id: comments.id });
  if (!deleted) return c.json({ error: "Comment not found" }, 404);
  return c.json({ success: true });
});

// GET /api/comments/pending/all — pending comments only (admin only)
commentsRouter.get("/pending/all", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const results = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      content: comments.content,
      approved: comments.approved,
      createdAt: comments.createdAt,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .leftJoin(posts, eq(comments.postId, posts.id))
    .where(eq(comments.approved, false))
    .orderBy(desc(comments.createdAt));
  return c.json(results);
});

// GET /api/comments/all/admin — ALL comments with post info (admin only)
commentsRouter.get("/all/admin", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const results = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      content: comments.content,
      approved: comments.approved,
      createdAt: comments.createdAt,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .leftJoin(posts, eq(comments.postId, posts.id))
    .orderBy(desc(comments.createdAt));
  return c.json(results);
});
