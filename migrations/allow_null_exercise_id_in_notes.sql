-- Allow exercise_id to be NULL for global notes
-- This migration updates the exercise_notes table to allow NULL values in exercise_id column

ALTER TABLE exercise_notes 
ALTER COLUMN exercise_id DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN exercise_notes.exercise_id IS 'Exercise ID - NULL for global course notes, specific exercise ID for exercise-specific notes';
