-- Master RLS Policy Application Script
-- This script applies all RLS policies in the correct order
-- to fix the course_enrollments API issue

-- Start transaction
BEGIN;

-- Clean up existing policies first
\i migrations/rls/cleanup_existing_policies.sql

-- Apply RLS policies for courses table
\i migrations/rls/01_courses_rls_policies.sql

-- Apply RLS policies for course_enrollments table
\i migrations/rls/02_course_enrollments_rls_policies.sql

-- Apply RLS policies for course_terms table
\i migrations/rls/03_course_terms_rls_policies.sql

-- Verify all RLS policies are applied correctly
SELECT 
  'RLS Verification Summary' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms');

-- Show RLS status for all relevant tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename;

-- Show all policies for each table
SELECT 
  'Courses Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

SELECT 
  'Course Enrollments Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

SELECT 
  'Course Terms Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'course_terms'
ORDER BY policyname;

-- Commit transaction
COMMIT;

-- Final verification message
SELECT 'All RLS policies have been applied successfully!' as status; 