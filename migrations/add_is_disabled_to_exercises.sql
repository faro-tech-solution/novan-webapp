-- Add is_disabled column to exercises table
-- =========================================
-- This migration adds an is_disabled column to allow admins to disable exercises
-- Disabled exercises will not be shown to trainees but will still be visible to admins

-- Add is_disabled column with default value false
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when filtering disabled exercises
CREATE INDEX IF NOT EXISTS idx_exercises_is_disabled ON exercises(is_disabled);

-- Update existing exercises to have is_disabled = false
UPDATE exercises SET is_disabled = false WHERE is_disabled IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN exercises.is_disabled IS 'Whether the exercise is disabled. Disabled exercises are hidden from trainees but visible to admins/trainers.';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'is_disabled column added to exercises table successfully';
    RAISE NOTICE 'All existing exercises have been set to is_disabled = false';
END $$;
