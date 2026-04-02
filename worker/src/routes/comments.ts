import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import { comments, posts, users } from "../db/schema";
import { requireAdmin, optionalAuth } from "../middleware/auth";
import type { Env, Variables } from "../middleware/auth";

export const commentsRouter = new Hono<{
  Bindings: Env;
  Variables: Partial<Variables>;
}>();

// GET /api/comments/:postId — list approved comments for a post
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

// POST /api/comments/:postId — submit a comment
commentsRouter.post("/:postId", optionalAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { postId } = c.req.param();
  const userId = c.get("userId");
  const body = await c.req.json();
  const { authorName, authorEmail, content } = body;

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

  // If authenticated user, get their info
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
      autoApproved = true; // Registered users auto-approved
    }
  } else {
    // Anonymous: require name and email
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

// GET /api/comments/pending — all pending comments (admin only)
commentsRouter.get("/pending/all", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const results = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(eq(comments.approved, false))
    .orderBy(desc(comments.createdAt));
  return c.json(results);
});
