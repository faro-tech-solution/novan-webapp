-- Migration: Update notifications table structure
-- Date: 2025-07-13

ALTER TABLE notifications
  DROP COLUMN IF EXISTS link,
  DROP COLUMN IF EXISTS expires_at,
  DROP COLUMN IF EXISTS icon,
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id); 