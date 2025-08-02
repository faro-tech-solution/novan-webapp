-- Test Fixed RLS Policies
-- This script tests the corrected RLS policies without the non-existent created_by column

-- Test 1: Check if RLS is enabled
SELECT '=== RLS Status Check ===' as test_name;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename;

-- Test 2: Check current user
SELECT '=== Current User Check ===' as test_name;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Test 3: Check user profile
SELECT '=== User Profile Check ===' as test_name;
SELECT 
  id,
  first_name,
  last_name,
  role,
  email
FROM profiles 
WHERE id = auth.uid();

-- Test 4: Test basic table access
SELECT '=== Basic Table Access Test ===' as test_name;

-- Test courses access (should work for authenticated users)
SELECT 
  'courses' as table_name,
  COUNT(*) as record_count
FROM courses;

-- Test course_enrollments access (should work for user's own enrollments)
SELECT 
  'course_enrollments' as table_name,
  COUNT(*) as record_count
FROM course_enrollments;

-- Test course_terms access (should work for authenticated users)
SELECT 
  'course_terms' as table_name,
  COUNT(*) as record_count
FROM course_terms;

-- Test 5: Test the specific API query that was failing
SELECT '=== Course Enrollments API Test ===' as test_name;

-- Simulate the API query that was failing
SELECT 
  ce.id as enrollment_id,
  ce.student_id,
  ce.course_id,
  ce.status as enrollment_status,
  ce.created_at as enrollment_created_at,
  c.id as course_id,
  c.name as course_name,
  c.description as course_description,
  c.status as course_status,
  ct.id as term_id,
  ct.name as term_name,
  ct.start_date,
  ct.end_date
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
LEFT JOIN course_terms ct ON c.id = ct.course_id
WHERE ce.student_id = auth.uid()
ORDER BY ce.created_at DESC
LIMIT 5;

-- Test 6: Check for orphaned records
SELECT '=== Orphaned Records Check ===' as test_name;

-- Check for course_enrollments without corresponding courses
SELECT 
  'course_enrollments without courses' as issue,
  COUNT(*) as count
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE c.id IS NULL;

-- Check for courses without corresponding course_terms
SELECT 
  'courses without course_terms' as issue,
  COUNT(*) as count
FROM courses c
LEFT JOIN course_terms ct ON c.id = ct.course_id
WHERE ct.id IS NULL;

-- Test 7: Summary
SELECT '=== Test Summary ===' as test_name;
SELECT 
  'RLS Policies Applied' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
    ) THEN 'PASS'
    ELSE 'FAIL'
  END as result;

SELECT 
  'Tables with RLS Enabled' as status,
  COUNT(*) as count
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
AND rowsecurity = true;

SELECT 
  'Total Policies Applied' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms');

-- Final status
SELECT '=== Fixed RLS Policy Test Complete ===' as status; 