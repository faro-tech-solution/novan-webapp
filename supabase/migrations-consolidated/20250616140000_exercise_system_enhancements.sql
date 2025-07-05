-- Consolidated Exercise System Enhancements Migration
-- This migration consolidates all exercise-related improvements

-- Update exercise_submissions table
ALTER TABLE exercise_submissions
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Remove student_name and email columns if they exist (legacy cleanup)
ALTER TABLE exercise_submissions
DROP COLUMN IF EXISTS student_name,
DROP COLUMN IF EXISTS email;

-- Add estimated_time to exercises table
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Update exercise policies
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can update exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can delete exercises" ON exercises;

-- Create improved exercise policies
CREATE POLICY "Users can view all exercises" ON exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Trainers can manage exercises" ON exercises FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('trainer', 'admin')
    ));

-- Add comments for documentation
COMMENT ON COLUMN exercise_submissions.first_name IS 'Student first name from profile';
COMMENT ON COLUMN exercise_submissions.last_name IS 'Student last name from profile';
COMMENT ON COLUMN exercise_submissions.estimated_time IS 'Estimated time to complete in minutes';
COMMENT ON COLUMN exercises.estimated_time IS 'Estimated time to complete in minutes';
