-- Migration: Add exercise_submissions_conversation table for trainee-trainer chat
-- Date: 2024-06-09

CREATE TABLE IF NOT EXISTS exercise_submissions_conversation (
    id BIGSERIAL PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES exercise_submissions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    meta_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_conversation_submission_id 
ON exercise_submissions_conversation(submission_id);

CREATE INDEX IF NOT EXISTS idx_exercise_submissions_conversation_sender_id 
ON exercise_submissions_conversation(sender_id);

CREATE INDEX IF NOT EXISTS idx_exercise_submissions_conversation_created_at 
ON exercise_submissions_conversation(created_at); 