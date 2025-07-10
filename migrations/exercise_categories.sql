-- Exercise Categories Migration
-- =============================
-- This migration adds exercise categories to organize exercises within courses
-- Each course can have multiple categories, and each category can contain multiple exercises

-- Create exercise_categories table
CREATE TABLE IF NOT EXISTS public.exercise_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, name)
);

-- Add category_id to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.exercise_categories(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_categories_course_id ON exercise_categories(course_id);
CREATE INDEX IF NOT EXISTS idx_exercise_categories_order ON exercise_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_category_id ON exercises(category_id);

-- RLS policies for exercise_categories have been moved to 03_exercises_rls.sql

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exercise_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_exercise_categories_updated_at
  BEFORE UPDATE ON exercise_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_categories_updated_at();

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Exercise categories system created successfully:';
    RAISE NOTICE '- exercise_categories table created';
    RAISE NOTICE '- category_id column added to exercises table';
    RAISE NOTICE '- RLS policies configured for exercise_categories';
    RAISE NOTICE '- Indexes created for performance';
END $$; 