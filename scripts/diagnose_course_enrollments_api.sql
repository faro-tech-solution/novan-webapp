-- Diagnostic script for course_enrollments API issue
-- This script investigates why related data (courses, course_terms) is empty

-- 1. Check the specific user's enrollments
SELECT 
  ce.id,
  ce.student_id,
  ce.course_id,
  ce.status,
  ce.enrolled_at,
  ce.term_id,
  ce.created_at,
  ce.updated_at
FROM course_enrollments ce
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
ORDER BY ce.enrolled_at DESC;

-- 2. Check if the courses exist for this user's enrollments
SELECT 
  ce.id as enrollment_id,
  ce.course_id,
  ce.term_id,
  c.id as course_exists,
  c.name as course_name,
  c.status as course_status,
  c.instructor_id,
  c.instructor_name
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
ORDER BY ce.enrolled_at DESC;

-- 3. Check if the course_terms exist for this user's enrollments
SELECT 
  ce.id as enrollment_id,
  ce.course_id,
  ce.term_id,
  ct.id as term_exists,
  ct.name as term_name,
  ct.start_date,
  ct.end_date,
  ct.course_id as term_course_id
FROM course_enrollments ce
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
ORDER BY ce.enrolled_at DESC;

-- 4. Check for orphaned enrollments (course_id doesn't exist in courses table)
SELECT 
  ce.id,
  ce.course_id,
  ce.student_id,
  ce.status,
  ce.enrolled_at
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND c.id IS NULL;

-- 5. Check for orphaned term references (term_id doesn't exist in course_terms table)
SELECT 
  ce.id,
  ce.term_id,
  ce.course_id,
  ce.student_id,
  ce.status
FROM course_enrollments ce
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND ce.term_id IS NOT NULL
  AND ct.id IS NULL;

-- 6. Check the courses table structure and data
SELECT 
  id,
  name,
  instructor_id,
  instructor_name,
  status,
  created_at
FROM courses
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check the course_terms table structure and data
SELECT 
  id,
  name,
  course_id,
  start_date,
  end_date,
  created_at
FROM course_terms
ORDER BY created_at DESC
LIMIT 10;

-- 8. Test the exact API query structure
WITH test_enrollment AS (
  SELECT * FROM course_enrollments 
  WHERE student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd' 
  LIMIT 1
)
SELECT 
  te.id,
  te.course_id,
  te.enrolled_at,
  te.term_id,
  c.id as course_id_from_join,
  c.name as course_name,
  c.description as course_description,
  ct.id as term_id_from_join,
  ct.name as term_name,
  ct.start_date,
  ct.end_date
FROM test_enrollment te
LEFT JOIN courses c ON te.course_id = c.id
LEFT JOIN course_terms ct ON te.term_id = ct.id;

-- 9. Check foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'course_enrollments';

-- 10. Check RLS policies on related tables
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
WHERE tablename IN ('course_enrollments', 'courses', 'course_terms')
ORDER BY tablename, policyname;

-- 11. Check if there are any data type mismatches
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
  AND column_name IN ('course_id', 'term_id', 'student_id');

-- 12. Check for any triggers that might affect the data
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('course_enrollments', 'courses', 'course_terms')
ORDER BY event_object_table, trigger_name; 