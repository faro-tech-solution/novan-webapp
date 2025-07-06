-- RLS Policies for Courses Table
-- This migration creates Row Level Security policies for the courses table
-- to ensure proper access control and fix the course_enrollments API issue

-- Enable RLS on courses table if not already enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view courses" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can manage course terms" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Students can view enrolled courses" ON courses;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;
DROP POLICY IF EXISTS "Trainers can view assigned courses" ON courses;
DROP POLICY IF EXISTS "Trainers can update assigned courses" ON courses;
DROP POLICY IF EXISTS "Course creators can update their courses" ON courses;
DROP POLICY IF EXISTS "Course creators can delete their courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete their courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete any course" ON courses;

-- Policy 1: Users can view courses (basic read access)
-- This policy allows all authenticated users to view courses
-- This is needed for the course_enrollments API to work properly
CREATE POLICY "Users can view courses" ON courses
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 2: Instructors can manage their own courses
-- Instructors can create, update, and delete courses they created
CREATE POLICY "Instructors can manage their own courses" ON courses
FOR ALL USING (
  auth.uid() = instructor_id
);

-- Policy 3: Admins can manage all courses
-- Admins have full access to all courses
CREATE POLICY "Admins can manage all courses" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 4: Students can view courses they are enrolled in
-- Students can view courses they are actively enrolled in
CREATE POLICY "Students can view enrolled courses" ON courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_enrollments ce
    JOIN profiles p ON ce.student_id = p.id
    WHERE ce.course_id = courses.id
    AND ce.student_id = auth.uid()
    AND ce.status = 'active'
    AND p.role = 'trainee'
  )
);

-- Policy 5: Public can view active courses (optional)
-- Unauthenticated users can view active courses (if needed)
CREATE POLICY "Public can view active courses" ON courses
FOR SELECT USING (
  status = 'active'
);

-- Policy 6: Trainers can view courses they are assigned to
-- Trainers can view courses they are assigned to via teacher_course_assignments
CREATE POLICY "Trainers can view assigned courses" ON courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = courses.id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 7: Trainers can update courses they are assigned to
-- Trainers can update courses they are assigned to (limited fields)
CREATE POLICY "Trainers can update assigned courses" ON courses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = courses.id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = courses.id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 8: Instructors can delete their courses
-- Instructors can delete courses they created (if no active enrollments)
CREATE POLICY "Instructors can delete their courses" ON courses
FOR DELETE USING (
  auth.uid() = instructor_id
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE course_id = courses.id 
    AND status = 'active'
  )
);

-- Policy 9: Admins can delete any course
-- Admins can delete any course regardless of enrollments
CREATE POLICY "Admins can delete any course" ON courses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_course_id ON teacher_course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_teacher_id ON teacher_course_assignments(teacher_id);

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'courses';

-- List all policies for courses table
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
WHERE tablename = 'courses'
ORDER BY policyname; 