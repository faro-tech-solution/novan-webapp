-- Migration: Add Exercise Types
-- Date: 2025-07-02
-- Description: Add exercise_type column to exercises table and related fields for new exercise types

-- Add exercise_type column to exercises table
ALTER TABLE public.exercises
ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'form',
ADD COLUMN content_url TEXT,
ADD COLUMN auto_grade BOOLEAN DEFAULT FALSE;

-- Set all existing exercises to 'form' type
UPDATE public.exercises
SET exercise_type = 'form';

-- Update exercise_submissions table to support auto-grading
ALTER TABLE public.exercise_submissions
ADD COLUMN auto_graded BOOLEAN DEFAULT FALSE,
ADD COLUMN completion_percentage NUMERIC DEFAULT 0;

-- Add an index on exercise_type for faster queries
CREATE INDEX idx_exercises_type ON public.exercises(exercise_type);

-- Add comment for documentation
COMMENT ON COLUMN public.exercises.exercise_type IS 'Type of exercise: form, video, audio, simple';
COMMENT ON COLUMN public.exercises.content_url IS 'URL for media content in video and audio exercises';
COMMENT ON COLUMN public.exercises.auto_grade IS 'Whether the exercise is auto-graded';
COMMENT ON COLUMN public.exercise_submissions.auto_graded IS 'Whether this submission was auto-graded';
COMMENT ON COLUMN public.exercise_submissions.completion_percentage IS 'Percentage of completion for auto-graded exercises';
