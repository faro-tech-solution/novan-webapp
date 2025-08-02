-- RLS Policy Test Script
-- This script tests the RLS policies to ensure they work correctly
-- and fix the course_enrollments API issue

-- Test 1: Check RLS status for all relevant tables
SELECT '=== RLS Status Check ===' as test_name;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tablename;

-- Test 2: List all policies for each table
SELECT '=== Courses Policies ===' as test_name;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

SELECT '=== Course Enrollments Policies ===' as test_name;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;

SELECT '=== Course Terms Policies ===' as test_name;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'course_terms'
ORDER BY policyname;

-- Test 3: Check current user and role
SELECT '=== Current User Check ===' as test_name;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Test 4: Check user profile
SELECT '=== User Profile Check ===' as test_name;
SELECT 
  id,
  first_name,
  last_name,
  role,
  email
FROM profiles 
WHERE id = auth.uid();

-- Test 5: Test basic access to tables
SELECT '=== Basic Table Access Test ===' as test_name;

-- Test courses access
SELECT 
  'courses' as table_name,
  COUNT(*) as record_count
FROM courses;

-- Test course_enrollments access
SELECT 
  'course_enrollments' as table_name,
  COUNT(*) as record_count
FROM course_enrollments;

-- Test course_terms access
SELECT 
  'course_terms' as table_name,
  COUNT(*) as record_count
FROM course_terms;

-- Test 6: Test course_enrollments API query
SELECT '=== Course Enrollments API Test ===' as test_name;

-- Simulate the API query that was failing
SELECT 
  ce.id as enrollment_id,
  ce.student_id,
  ce.course_id,
  ce.status as enrollment_status,
  ce.created_at as enrollment_created_at,
  c.id as course_id,
  c.title as course_title,
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
ORDER BY ce.created_at DESC;

-- Test 7: Check for orphaned records
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

-- Test 8: Test role-based access
SELECT '=== Role-Based Access Test ===' as test_name;

-- Test admin access (if user is admin)
SELECT 
  'admin_courses_access' as test,
  COUNT(*) as accessible_courses
FROM courses
WHERE EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role = 'admin'
);

-- Test instructor access (if user is instructor)
SELECT 
  'instructor_courses_access' as test,
  COUNT(*) as accessible_courses
FROM courses
WHERE instructor_id = auth.uid();

-- Test student access (if user is student)
SELECT 
  'student_enrollments_access' as test,
  COUNT(*) as accessible_enrollments
FROM course_enrollments
WHERE student_id = auth.uid();

-- Test 9: Performance check
SELECT '=== Performance Check ===' as test_name;

-- Check if indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('courses', 'course_enrollments', 'course_terms')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Test 10: Foreign key relationships
SELECT '=== Foreign Key Check ===' as test_name;

-- Check foreign key constraints
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('courses', 'course_enrollments', 'course_terms')
ORDER BY tc.table_name, kcu.column_name;

-- Test 11: Summary
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
SELECT '=== RLS Policy Test Complete ===' as status; 