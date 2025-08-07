-- Fix Infinite Recursion in Course Enrollments RLS Policies
-- This script fixes the infinite recursion issue by simplifying the RLS policies

-- Start transaction
BEGIN;

-- ========================================
-- STEP 1: Drop all existing course_enrollments policies
-- ========================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can manage their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can view assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can update assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can update course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments for available courses" ON course_enrollments;

-- ========================================
-- STEP 2: Create simplified RLS policies
-- ========================================

-- Policy 1: Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Users can view their own enrollments (simplified)
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
FOR SELECT USING (
  auth.uid() = student_id
);

-- Policy 3: Users can create their own enrollments (simplified)
CREATE POLICY "Users can create their own enrollments" ON course_enrollments
FOR INSERT WITH CHECK (
  auth.uid() = student_id
);

-- Policy 4: Users can update their own enrollments (simplified)
CREATE POLICY "Users can update their own enrollments" ON course_enrollments
FOR UPDATE USING (
  auth.uid() = student_id
) WITH CHECK (
  auth.uid() = student_id
);

-- Policy 5: Trainers can view enrollments for courses they teach (simplified)
CREATE POLICY "Trainers can view course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 6: Trainers can update enrollments for courses they teach (simplified)
CREATE POLICY "Trainers can update course enrollments" ON course_enrollments
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
-- STEP 3: Verify the policies
-- ========================================

-- Show all policies for course_enrollments
SELECT 
  'Course Enrollments Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

-- Show RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'course_enrollments';

-- ========================================
-- STEP 4: Test the policies
-- ========================================

-- Test basic access (this should not cause infinite recursion)
SELECT 
  'Testing course_enrollments access' as test_name,
  COUNT(*) as total_enrollments
FROM course_enrollments;

-- Commit the transaction
COMMIT;

-- ========================================
-- SUMMARY
-- ========================================

/*
The infinite recursion was caused by complex RLS policies that referenced:
1. teacher_course_assignments table in course_enrollments policies
2. Multiple nested EXISTS clauses
3. Circular references between policies

The fix:
1. Simplified all policies to avoid complex joins
2. Removed references to teacher_course_assignments in course_enrollments policies
3. Used direct foreign key relationships instead of complex joins
4. Separated concerns between different user roles

This should resolve the "infinite recursion detected in policy for relation 'course_enrollments'" error.
*/ 