import { pgTable, text, boolean, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  tempCode: text("temp_code"),
  tempCodeExpiresAt: timestamp("temp_code_expires_at"),
  passcodeResendCount: integer("passcode_resend_count").notNull().default(0),
  lastPasscodeSentAt: timestamp("last_passcode_sent_at"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Posts ────────────────────────────────────────────────────────────
export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  published: boolean("published").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Comments ─────────────────────────────────────────────────────────
export const comments = pgTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  // Nullable for anonymous comments
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  // Reply support: parentId references another comment
  parentId: text("parent_id"), // self-reference added via migration (circular ref workaround)
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  // Registered user comments auto-approved; anonymous ones need admin approval
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Portfolio Items ──────────────────────────────────────────────────
export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  imgUrl: text("img_url").notNull(),
  stack: text("stack").array().notNull().default([]),
  link: text("link"),
  github: text("github"),
  description: text("description").notNull(),
  category: text("category").notNull().default("Full Stack"),
  featured: boolean("featured").notNull().default(false),
  showOnHome: boolean("show_on_home").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Timeline Items ───────────────────────────────────────────────────
export const timelineItems = pgTable("timeline_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  year: text("year").notNull(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  duration: text("duration").notNull(),
  details: text("details").array().notNull().default([]),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Site Settings ───────────────────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Contact Messages ─────────────────────────────────────────────────
export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type NewPortfolioItem = typeof portfolioItems.$inferInsert;
export type TimelineItem = typeof timelineItems.$inferSelect;
export type NewTimelineItem = typeof timelineItems.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

