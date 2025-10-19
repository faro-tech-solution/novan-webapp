-- Add exercise_qa_bookmark table for bookmark system
-- ===================================================
-- This migration creates the bookmark table for Q&A posts

CREATE TABLE IF NOT EXISTS exercise_qa_bookmark (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_id UUID NOT NULL REFERENCES exercise_qa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(qa_id, user_id) -- each user can only bookmark a post once
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_qa_bookmark_qa_id ON exercise_qa_bookmark(qa_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_bookmark_user_id ON exercise_qa_bookmark(user_id);

-- Add comment
COMMENT ON TABLE exercise_qa_bookmark IS 'Tracks user bookmarks on Q&A posts';

-- Enable Row Level Security
ALTER TABLE exercise_qa_bookmark ENABLE ROW LEVEL SECURITY;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully created exercise_qa_bookmark table with indexes and RLS enabled';
END $$;

