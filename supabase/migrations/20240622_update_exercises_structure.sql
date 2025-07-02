-- Migration: Update exercises table to support modern exercise structure
-- Date: 2025-07-02
-- Description: Update exercises table structure to match application requirements

-- First check if we need to add form_structure column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'form_structure') THEN
    ALTER TABLE public.exercises ADD COLUMN form_structure JSONB DEFAULT '{"questions": []}';
  END IF;
END $$;

-- Add missing columns for modern exercise types if they don't exist
DO $$ 
BEGIN
  -- Add course_id column if it doesn't exist (will be linked to courses table when available)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'course_id') THEN
    ALTER TABLE public.exercises ADD COLUMN course_id UUID;
  END IF;

  -- Add days_to_open and days_to_due for relative dates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'days_to_open') THEN
    ALTER TABLE public.exercises ADD COLUMN days_to_open INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'days_to_due') THEN
    ALTER TABLE public.exercises ADD COLUMN days_to_due INTEGER DEFAULT 7;
  END IF;

  -- Add days_to_close for when exercises close (optional)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'days_to_close') THEN
    ALTER TABLE public.exercises ADD COLUMN days_to_close INTEGER;
  END IF;

  -- Add exercise_type column for different exercise types
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'exercise_type') THEN
    ALTER TABLE public.exercises ADD COLUMN exercise_type TEXT DEFAULT 'form' CHECK (exercise_type IN ('form', 'video', 'audio', 'simple'));
  END IF;

  -- Add content_url for media exercises
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'content_url') THEN
    ALTER TABLE public.exercises ADD COLUMN content_url TEXT;
  END IF;

  -- Add auto_grade flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercises' AND column_name = 'auto_grade') THEN
    ALTER TABLE public.exercises ADD COLUMN auto_grade BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing exercises to have sensible defaults
UPDATE public.exercises 
SET 
  days_to_open = 0,
  days_to_due = 7
WHERE days_to_open IS NULL OR days_to_due IS NULL;

-- Update difficulty values to English for consistency
UPDATE public.exercises 
SET difficulty = CASE 
  WHEN difficulty = 'آسان' THEN 'beginner'
  WHEN difficulty = 'متوسط' THEN 'intermediate'  
  WHEN difficulty = 'سخت' THEN 'advanced'
  ELSE difficulty
END
WHERE difficulty IN ('آسان', 'متوسط', 'سخت');

-- Update the constraint to allow English difficulty values
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_difficulty_check;
ALTER TABLE public.exercises ADD CONSTRAINT exercises_difficulty_check 
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'آسان', 'متوسط', 'سخت'));

-- Add comments for documentation
COMMENT ON COLUMN public.exercises.form_structure IS 'JSON structure for form-based exercises';
COMMENT ON COLUMN public.exercises.course_id IS 'Foreign key to courses table';
COMMENT ON COLUMN public.exercises.days_to_open IS 'Number of days after creation when exercise opens';
COMMENT ON COLUMN public.exercises.days_to_due IS 'Number of days after creation when exercise is due';
COMMENT ON COLUMN public.exercises.days_to_close IS 'Number of days after creation when exercise closes (optional)';
COMMENT ON COLUMN public.exercises.exercise_type IS 'Type of exercise: form, video, audio, or simple';
COMMENT ON COLUMN public.exercises.content_url IS 'URL for media content (video/audio exercises)';
COMMENT ON COLUMN public.exercises.auto_grade IS 'Whether this exercise should be auto-graded';

-- Add missing columns to exercise_submissions table
DO $$ 
BEGIN
  -- Add auto_graded column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercise_submissions' AND column_name = 'auto_graded') THEN
    ALTER TABLE public.exercise_submissions ADD COLUMN auto_graded BOOLEAN DEFAULT false;
  END IF;

  -- Add completion_percentage column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'exercise_submissions' AND column_name = 'completion_percentage') THEN
    ALTER TABLE public.exercise_submissions ADD COLUMN completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
  END IF;
END $$;

-- Add comments for exercise_submissions
COMMENT ON COLUMN public.exercise_submissions.auto_graded IS 'Whether this submission was auto-graded';
COMMENT ON COLUMN public.exercise_submissions.completion_percentage IS 'Percentage of completion for the exercise';
