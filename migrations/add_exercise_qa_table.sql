-- Add exercise_qa table for Q&A system
-- =====================================
-- This migration creates the main Q&A table for threaded discussions on exercises

CREATE TABLE IF NOT EXISTS exercise_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, -- for main questions, null for answers/replies
  description TEXT NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES exercise_qa(id) ON DELETE CASCADE, -- for threaded replies
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_qa_exercise_id ON exercise_qa(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_parent_id ON exercise_qa(parent_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_user_id ON exercise_qa(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_created_at ON exercise_qa(created_at DESC);

-- Add comments
COMMENT ON TABLE exercise_qa IS 'Stores questions, answers, and replies for exercises in a threaded structure';
COMMENT ON COLUMN exercise_qa.title IS 'Only for main questions (null for answers/replies)';
COMMENT ON COLUMN exercise_qa.parent_id IS 'NULL for main questions, references parent for answers/replies';
COMMENT ON COLUMN exercise_qa.vote_count IS 'Automatically calculated by trigger';

-- Enable Row Level Security
ALTER TABLE exercise_qa ENABLE ROW LEVEL SECURITY;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully created exercise_qa table with indexes and RLS enabled';
END $$;

