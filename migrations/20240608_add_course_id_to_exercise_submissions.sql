-- Migration: Make course_id in exercises table NOT NULL
-- Ensure all existing exercises have a course_id before altering the column

-- 1. (Optional) If you know a default course_id to use for orphaned exercises, set it here:
-- UPDATE public.exercises SET course_id = '<some-valid-course-uuid>' WHERE course_id IS NULL;

-- 2. If you want to error on NULLs instead, you can check:
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.exercises WHERE course_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot set NOT NULL on exercises.course_id: NULL values exist.';
  END IF;
END$$;

-- 3. Make the column NOT NULL
ALTER TABLE public.exercises
ALTER COLUMN course_id SET NOT NULL; 