-- Add exercise_qa_vote table for voting system
-- ==============================================
-- This migration creates the voting table for Q&A posts

CREATE TABLE IF NOT EXISTS exercise_qa_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_qa_id UUID NOT NULL REFERENCES exercise_qa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exercise_qa_id, user_id) -- each user can only vote once per post
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_qa_vote_qa_id ON exercise_qa_vote(exercise_qa_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_vote_user_id ON exercise_qa_vote(user_id);

-- Add comments
COMMENT ON TABLE exercise_qa_vote IS 'Tracks user votes on Q&A posts (upvotes and downvotes)';
COMMENT ON COLUMN exercise_qa_vote.vote_type IS '1 for upvote, -1 for downvote';

-- Enable Row Level Security
ALTER TABLE exercise_qa_vote ENABLE ROW LEVEL SECURITY;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully created exercise_qa_vote table with indexes and RLS enabled';
END $$;

