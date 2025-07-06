-- Check Existing RLS Policies
-- This script shows what RLS policies currently exist in the database

SELECT '=== Current RLS Policies ===' as status;

-- Show all policies for the relevant tables
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
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename, policyname;

-- Show RLS status for tables
SELECT '=== RLS Status for Tables ===' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename;

-- Count policies per table
SELECT '=== Policy Count by Table ===' as status;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
GROUP BY tablename
ORDER BY tablename;

SELECT '=== Check Complete ===' as status; 