-- Remove student_name and student_email columns from exercise_submissions
ALTER TABLE public.exercise_submissions
  DROP COLUMN IF EXISTS student_name,
  DROP COLUMN IF EXISTS student_email; 