-- Diagnostic script for student courses issue
-- Run this script to identify why /student-courses doesn't fetch any data

-- 1. Check if there are any users with trainee role
SELECT 
  id, 
  first_name, 
  last_name, 
  role, 
  email,
  created_at
FROM profiles 
WHERE role = 'trainee' 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check course enrollments for trainees
SELECT 
  ce.id,
  ce.student_id,
  ce.course_id,
  ce.status,
  ce.enrolled_at,
  ce.term_id,
  p.first_name,
  p.last_name,
  p.role,
  c.name as course_name,
  c.status as course_status
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
JOIN courses c ON ce.course_id = c.id
WHERE p.role = 'trainee'
ORDER BY ce.enrolled_at DESC
LIMIT 20;

-- 3. Check if there are any active enrollments
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_enrollments,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_enrollments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_enrollments
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
WHERE p.role = 'trainee';

-- 4. Check courses table
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

-- 5. Check if there are any enrollments without valid courses
SELECT 
  ce.id,
  ce.course_id,
  ce.student_id,
  ce.status,
  p.first_name,
  p.last_name,
  c.name as course_name
FROM course_enrollments ce
JOIN profiles p ON ce.student_id = p.id
LEFT JOIN courses c ON ce.course_id = c.id
WHERE p.role = 'trainee' AND c.id IS NULL
ORDER BY ce.enrolled_at DESC;

-- 6. Check if there are any enrollments without valid students
SELECT 
  ce.id,
  ce.course_id,
  ce.student_id,
  ce.status,
  c.name as course_name
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE p.id IS NULL
ORDER BY ce.enrolled_at DESC;

-- 7. Test the exact query that the frontend uses
-- Replace 'USER_ID_HERE' with an actual trainee user ID from step 1
WITH test_user AS (
  SELECT id FROM profiles WHERE role = 'trainee' LIMIT 1
)
SELECT 
  ce.id,
  ce.course_id,
  ce.enrolled_at,
  ce.status,
  c.id as course_id,
  c.name as course_name,
  c.description as course_description
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
CROSS JOIN test_user tu
WHERE ce.student_id = tu.id
  AND ce.status = 'active';

-- 8. Check RLS policies on course_enrollments table
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
WHERE tablename = 'course_enrollments';

-- 9. Check if the user has proper permissions
-- This will show what the current user can see
SELECT 
  current_user,
  session_user,
  current_database();

-- 10. Check for any foreign key constraint issues
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'course_enrollments'; 