-- Add sort column to exercises table
-- ===================================
-- This migration adds a sort column to the exercises table to enable custom ordering
-- Exercises will be sorted by this column (lowest to highest) and then by created_at (ascending) when sort values are equal

-- Add sort column with default value of 0
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS sort INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance on sorting
CREATE INDEX IF NOT EXISTS idx_exercises_sort ON exercises(sort);

-- Create composite index for the combined sort logic (sort ASC, created_at ASC)
CREATE INDEX IF NOT EXISTS idx_exercises_sort_created_at ON exercises(sort ASC, created_at ASC);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Sort column added to exercises table successfully';
    RAISE NOTICE 'New indexes created for optimal sorting performance';
END $$; 