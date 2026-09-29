import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { contactMessages } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import { sendEmail, generateContactEmailHtml, getContactEmail } from "../lib/email";
import type { Env, Variables } from "../middleware/auth";

export const contactRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

async function ensureContactTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      message text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
}

// POST /api/contact — Public contact form submission
contactRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = await c.req.parseBody().catch(() => ({}));
  }

  const name = (body.name || body.Name || "").trim();
  const email = (body.email || body.Email || "").trim();
  const message = (body.message || body.Message || "").trim();

  if (!name || !email || !message) {
    return c.json({ error: "Lütfen tüm alanları (İsim, E-posta ve Mesaj) doldurunuz." }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "Geçerli bir e-posta adresi giriniz." }, 400);
  }

  // 1. Save to DB
  let savedMessage: any = null;
  try {
    const [msg] = await db
      .insert(contactMessages)
      .values({ name, email, message })
      .returning();
    savedMessage = msg;
  } catch {
    await ensureContactTable(db);
    try {
      const [msg] = await db
        .insert(contactMessages)
        .values({ name, email, message })
        .returning();
      savedMessage = msg;
    } catch (e: any) {
      console.error("[Contact Route] DB insert error:", e);
    }
  }

  // 2. Send Email via Resend
  const recipientEmail = await getContactEmail(c.env, db);
  const emailHtml = generateContactEmailHtml(name, email, message);

  const emailResult = await sendEmail(
    {
      to: recipientEmail,
      subject: `📩 Yeni İletişim Mesajı: ${name}`,
      html: emailHtml,
      text: `Gönderen: ${name} <${email}>\n\nMesaj:\n${message}`,
    },
    c.env,
    db
  );

  return c.json({
    success: true,
    message: "Mesajınız başarıyla gönderildi! En kısa sürede geri dönüş yapılacaktır.",
    emailSent: emailResult.success,
    id: savedMessage?.id,
  }, 201);
});

// GET /api/contact — Admin only: list all received messages
contactRouter.get("/", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  try {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return c.json(messages);
  } catch {
    await ensureContactTable(db);
    return c.json([]);
  }
});

// PATCH /api/contact/:id/read — Admin only: mark as read
contactRouter.patch("/:id/read", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  try {
    const [updated] = await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return c.json(updated);
  } catch {
    return c.json({ error: "Mesaj güncellenemedi." }, 500);
  }
});

// DELETE /api/contact/:id — Admin only: delete message
contactRouter.delete("/:id", requireAdmin, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const { id } = c.req.param();
  try {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return c.json({ success: true });
  } catch {
    return c.json({ error: "Mesaj silinemedi." }, 500);
  }
});
