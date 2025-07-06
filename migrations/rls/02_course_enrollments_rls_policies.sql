-- RLS Policies for Course Enrollments Table
-- This migration creates Row Level Security policies for the course_enrollments table
-- to ensure proper access control and fix the course_enrollments API issue

-- Enable RLS on course_enrollments table if not already enabled
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can manage their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can view assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can update assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can update course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments for available courses" ON course_enrollments;

-- Policy 1: Users can view their own enrollments
-- Students can view their own course enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
FOR SELECT USING (
  auth.uid() = student_id
);

-- Policy 2: Instructors can view enrollments for their courses
-- Instructors can view all enrollments for courses they created
CREATE POLICY "Instructors can view course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 3: Admins can manage all enrollments
-- Admins have full access to all course enrollments
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 4: Students can manage their own enrollments
-- Students can create, update, and delete their own enrollments
CREATE POLICY "Students can manage their own enrollments" ON course_enrollments
FOR ALL USING (
  auth.uid() = student_id
) WITH CHECK (
  auth.uid() = student_id
);

-- Policy 5: Trainers can view enrollments for courses they are assigned to
-- Trainers can view enrollments for courses they are assigned to via teacher_course_assignments
CREATE POLICY "Trainers can view assigned course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_enrollments.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 6: Instructors can update enrollments for their courses
-- Instructors can update enrollment status for courses they created
CREATE POLICY "Instructors can update course enrollments" ON course_enrollments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 7: Trainers can update enrollments for courses they are assigned to
-- Trainers can update enrollment status for courses they are assigned to
CREATE POLICY "Trainers can update assigned course enrollments" ON course_enrollments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_enrollments.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_enrollments.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 8: Users can create enrollments for available courses
-- Users can enroll in courses that are active and available
CREATE POLICY "Users can create enrollments for available courses" ON course_enrollments
FOR INSERT WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.status = 'active'
  )
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments ce
    WHERE ce.course_id = course_enrollments.course_id
    AND ce.student_id = auth.uid()
    AND ce.status IN ('active', 'pending')
  )
);

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'course_enrollments';

-- List all policies for course_enrollments table
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
WHERE tablename = 'course_enrollments'
ORDER BY policyname; 