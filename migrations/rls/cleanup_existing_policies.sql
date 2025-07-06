-- Cleanup Existing RLS Policies
-- This script drops all existing RLS policies to avoid conflicts
-- Run this before applying the new RLS policies

-- Drop all existing policies for courses table
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

-- Drop all existing policies for course_enrollments table
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can manage their own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can view assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Trainers can update assigned course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors can update course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments for available courses" ON course_enrollments;

-- Drop all existing policies for course_terms table
DROP POLICY IF EXISTS "Users can view course terms" ON course_terms;
DROP POLICY IF EXISTS "Instructors can manage course terms" ON course_terms;
DROP POLICY IF EXISTS "Instructors can manage terms for their courses" ON course_terms;
DROP POLICY IF EXISTS "Admins can manage all course terms" ON course_terms;
DROP POLICY IF EXISTS "Trainers can view assigned course terms" ON course_terms;
DROP POLICY IF EXISTS "Trainers can update assigned course terms" ON course_terms;
DROP POLICY IF EXISTS "Course creators can manage course terms" ON course_terms;

-- Show current policies (should be empty)
SELECT '=== Current Policies After Cleanup ===' as status;
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename, policyname;

SELECT '=== Cleanup Complete ===' as status; 