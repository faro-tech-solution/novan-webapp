-- Master Script for Simplified RLS Policy Application
-- This script applies simplified RLS policies to avoid infinite recursion
-- and fix the course_enrollments API issue

-- Start transaction
BEGIN;

-- Clean up existing policies first (if needed)
-- Note: cleanup_existing_policies.sql has been removed as it's no longer needed

-- Apply RLS policies for profiles table
\i migrations/rls/01_profiles_rls.sql

-- Apply simplified RLS policies for courses table
\i migrations/rls/02_courses_rls.sql

-- Apply RLS policies for exercises table
\i migrations/rls/03_exercises_rls.sql

-- Apply RLS policies for wiki tables
\i migrations/rls/04_wiki_rls.sql

-- Apply RLS policies for tasks tables
\i migrations/rls/05_tasks_rls.sql

-- Apply RLS policies for groups tables
\i migrations/rls/06_groups_rls.sql

-- Apply RLS policies for awards tables
\i migrations/rls/07_awards_rls.sql

-- Apply RLS policies for activities and logs tables
\i migrations/rls/08_activities_logs_rls.sql

-- Apply RLS policies for notifications tables
\i migrations/rls/09_notifications_rls.sql

-- Apply RLS policies for accounting tables
\i migrations/rls/10_accounting_rls.sql

-- All profile, course-related and exercise-related RLS policies are now consolidated

-- Verify all RLS policies are applied correctly
SELECT 
  'Simplified RLS Verification Summary' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('profiles', 'courses', 'course_enrollments', 'course_terms', 'exercises', 'exercise_submissions', 'exercise_categories');

-- Show RLS status for all relevant tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'courses', 'course_enrollments', 'course_terms', 'exercises', 'exercise_submissions', 'exercise_categories')
ORDER BY tablename;

-- Show all policies for each table
SELECT 
  'Profiles Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

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

SELECT 
  'Exercises Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercises'
ORDER BY policyname;

SELECT 
  'Exercise Submissions Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_submissions'
ORDER BY policyname;

SELECT 
  'Exercise Categories Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_categories'
ORDER BY policyname;

-- Commit transaction
COMMIT;

-- Final verification message
SELECT 'Simplified RLS policies have been applied successfully!' as status; 