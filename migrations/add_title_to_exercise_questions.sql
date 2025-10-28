-- Migration: Add title field to exercise_questions table
-- Date: 2025-01-27
-- Description: Adds an optional title field to Q&A questions (required for main questions, optional for replies)

BEGIN;

-- Add title column to exercise_questions table (optional)
ALTER TABLE public.exercise_questions 
ADD COLUMN title TEXT;

-- Update existing main questions (parent_id IS NULL) to have a title based on content
UPDATE public.exercise_questions 
SET title = CASE 
  WHEN LENGTH(content) > 50 THEN LEFT(content, 47) || '...'
  ELSE content
END
WHERE parent_id IS NULL AND title IS NULL;

-- Add comment
COMMENT ON COLUMN public.exercise_questions.title IS 'Title/summary of the question (optional, typically used for main questions)';

COMMIT;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Title field added to exercise_questions table successfully';
  RAISE NOTICE 'Existing main questions updated with content-based titles';
  RAISE NOTICE 'Title field is optional - replies can be created without titles';
END $$;