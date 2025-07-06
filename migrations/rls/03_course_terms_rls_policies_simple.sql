-- Simplified RLS Policies for Course Terms Table
-- This migration creates Row Level Security policies for the course_terms table
-- without complex cross-table references that cause infinite recursion

-- Enable RLS on course_terms table if not already enabled
ALTER TABLE course_terms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view course terms" ON course_terms;
DROP POLICY IF EXISTS "Instructors can manage course terms" ON course_terms;
DROP POLICY IF EXISTS "Instructors can manage terms for their courses" ON course_terms;
DROP POLICY IF EXISTS "Admins can manage all course terms" ON course_terms;
DROP POLICY IF EXISTS "Trainers can view assigned course terms" ON course_terms;
DROP POLICY IF EXISTS "Trainers can update assigned course terms" ON course_terms;
DROP POLICY IF EXISTS "Course creators can manage course terms" ON course_terms;

-- Policy 1: Users can view course terms (basic read access)
-- All authenticated users can view course terms
-- This is needed for the course_enrollments API to work properly
CREATE POLICY "Users can view course terms" ON course_terms
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 2: Instructors can manage terms for their courses
-- Instructors can create, update, and delete terms for courses they created
CREATE POLICY "Instructors can manage terms for their courses" ON course_terms
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_terms.course_id
    AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_terms.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 3: Admins can manage all course terms
-- Admins have full access to all course terms
CREATE POLICY "Admins can manage all course terms" ON course_terms
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_course_terms_course_id ON course_terms(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'course_terms';

-- List all policies for course_terms table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'course_terms'
ORDER BY policyname; 