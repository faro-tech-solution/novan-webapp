-- Consolidated RLS Policies for All Course-Related Tables
-- This migration creates Row Level Security policies for courses, course_enrollments, and course_terms tables
-- to ensure proper access control and fix the course_enrollments API issue

-- ========================================
-- COURSES TABLE RLS POLICIES
-- ========================================

-- Enable RLS on courses table if not already enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Users can view courses" ON courses;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete any course" ON courses;
DROP POLICY IF EXISTS "Trainers can view assigned courses" ON courses;
DROP POLICY IF EXISTS "Trainees can view active courses" ON courses;
DROP POLICY IF EXISTS "Trainees can view enrolled courses" ON courses;

-- ========================================
-- COURSES TABLE - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all courses
-- Admins have full access to all courses
CREATE POLICY "Admins can manage all courses" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Admins can delete any course
-- Admins can delete any course regardless of enrollments
CREATE POLICY "Admins can delete any course" ON courses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- COURSES TABLE - TRAINERS RLS POLICIES
-- ========================================

-- Policy 4: Trainers can view courses they are assigned to
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

-- ========================================
-- COURSES TABLE - TRAINEES RLS POLICIES
-- ========================================

-- Policy 5: Trainees can view active courses
-- Trainees can view active courses
CREATE POLICY "Trainees can view active courses" ON courses
FOR SELECT USING (
  status = 'active'
);

-- Policy 6: Trainees can view courses they are enrolled in
-- Trainees can view courses they are actively enrolled in
CREATE POLICY "Trainees can view enrolled courses" ON courses
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- COURSES TABLE - GENERAL RLS POLICIES
-- ========================================

-- Policy 7: Users can view courses (basic read access)
-- This policy allows all authenticated users to view courses
-- This is needed for the course_enrollments API to work properly
CREATE POLICY "Users can view courses" ON courses
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 8: Public can view active courses (optional)
-- Unauthenticated users can view active courses (if needed)
CREATE POLICY "Public can view active courses" ON courses
FOR SELECT USING (
  status = 'active'
);

-- ========================================
-- COURSE ENROLLMENTS TABLE RLS POLICIES
-- ========================================

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

-- ========================================
-- COURSE ENROLLMENTS - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all enrollments
-- Admins have full access to all course enrollments
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- COURSE ENROLLMENTS - TRAINERS RLS POLICIES
-- ========================================

-- Policy 2: Trainers can view enrollments for courses they are assigned to
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

-- Policy 3: Trainers can update enrollments for courses they are assigned to
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

-- ========================================
-- COURSE ENROLLMENTS - TRAINEES RLS POLICIES
-- ========================================

-- Policy 4: Trainees can view their own enrollments
-- Trainees can view their own course enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
FOR SELECT USING (
  auth.uid() = student_id
);

-- Policy 5: Trainees can manage their own enrollments
-- Trainees can create, update, and delete their own enrollments
CREATE POLICY "Students can manage their own enrollments" ON course_enrollments
FOR ALL USING (
  auth.uid() = student_id
) WITH CHECK (
  auth.uid() = student_id
);

-- Policy 6: Trainees can create enrollments for available courses
-- Trainees can enroll in courses that are active and available
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

-- ========================================
-- COURSE ENROLLMENTS - TRAINERS (INSTRUCTORS) RLS POLICIES
-- ========================================

-- Policy 7: Trainers can view enrollments for their courses
-- Trainers can view all enrollments for courses they created
CREATE POLICY "Instructors can view course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 8: Trainers can update enrollments for their courses
-- Trainers can update enrollment status for courses they created
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

-- ========================================
-- COURSE TERMS TABLE RLS POLICIES
-- ========================================

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

-- ========================================
-- COURSE TERMS - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all course terms
-- Admins have full access to all course terms
CREATE POLICY "Admins can manage all course terms" ON course_terms
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- COURSE TERMS - TRAINERS RLS POLICIES
-- ========================================

-- Policy 2: Trainers can manage terms for their courses
-- Trainers can create, update, and delete terms for courses they created
CREATE POLICY "Instructors can manage course terms" ON course_terms
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

-- Policy 3: Trainers can view terms for courses they are assigned to
-- Trainers can view terms for courses they are assigned to via teacher_course_assignments
CREATE POLICY "Trainers can view assigned course terms" ON course_terms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_terms.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 4: Trainers can update terms for courses they are assigned to
-- Trainers can update terms for courses they are assigned to
CREATE POLICY "Trainers can update assigned course terms" ON course_terms
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_terms.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_terms.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 5: Trainers can manage terms for their courses
-- Trainers can manage terms for courses they created
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

-- ========================================
-- COURSE TERMS - GENERAL RLS POLICIES
-- ========================================

-- Policy 6: Users can view course terms (basic read access)
-- All authenticated users can view course terms
-- This is needed for the course_enrollments API to work properly
CREATE POLICY "Users can view course terms" ON course_terms
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- TEACHER ASSIGNMENTS RLS POLICIES
-- ========================================

-- ========================================
-- TEACHER_COURSE_ASSIGNMENTS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on teacher_course_assignments table if not already enabled
ALTER TABLE teacher_course_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Public can view assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Teachers can view their own course assignments" ON teacher_course_assignments;

-- Policy 1: Teachers can view their own assignments
CREATE POLICY "Teachers can view their assignments" ON teacher_course_assignments
FOR SELECT USING (
  teacher_id = auth.uid()
);

-- Policy 2: Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments" ON teacher_course_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Public can view assignments (for dashboards)
CREATE POLICY "Public can view assignments" ON teacher_course_assignments
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- TEACHER_TERM_ASSIGNMENTS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on teacher_term_assignments table if not already enabled
ALTER TABLE teacher_term_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their own term assignments" ON teacher_term_assignments;

-- Policy 1: Teachers can view their own term assignments
CREATE POLICY "Teachers can view their own term assignments" ON teacher_term_assignments
FOR SELECT USING (
  teacher_id = auth.uid()
);

-- ========================================
-- PERFORMANCE INDEXES
-- ========================================

-- Create indexes to improve RLS policy performance for courses table
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_course_id ON teacher_course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_teacher_id ON teacher_course_assignments(teacher_id);

-- Create indexes to improve RLS policy performance for course_enrollments table
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- Create indexes to improve RLS policy performance for course_terms table
CREATE INDEX IF NOT EXISTS idx_course_terms_course_id ON course_terms(course_id);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify RLS is enabled for all course-related tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms', 'teacher_course_assignments', 'teacher_term_assignments')
ORDER BY tablename;

-- List all policies for courses table
SELECT 
  'Courses Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

-- List all policies for course_enrollments table
SELECT 
  'Course Enrollments Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- List all policies for course_terms table
SELECT 
  'Course Terms Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'course_terms'
ORDER BY policyname;

-- List all policies for teacher_course_assignments table
SELECT 
  'Teacher Course Assignments Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'teacher_course_assignments'
ORDER BY policyname;

-- List all policies for teacher_term_assignments table
SELECT 
  'Teacher Term Assignments Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'teacher_term_assignments'
ORDER BY policyname; 