-- Migration: Add parentId to comments for reply support
-- Run with: npx drizzle-kit push  OR  paste into Neon SQL editor

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE;

-- Add post slug/title to comments via join - no schema change needed (handled in query)