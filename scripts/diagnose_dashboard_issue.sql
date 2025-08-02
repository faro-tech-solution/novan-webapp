-- Diagnostic script for trainee dashboard statistics issue
-- Run this script to identify why dashboard statistics are showing 0

-- 1. Check if there are any users with trainee role
SELECT 
  id, 
  first_name, 
  last_name, 
  role, 
  class_name,
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
  c.name as course_name,
  ct.name as term_name,
  ct.start_date as term_start_date,
  ct.end_date as term_end_date
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.status = 'active'
ORDER BY ce.enrolled_at DESC
LIMIT 20;

-- 3. Check exercises for enrolled courses
SELECT 
  e.id,
  e.title,
  e.course_id,
  e.days_to_open,
  e.days_to_due,
  e.days_to_close,
  e.points,
  e.created_at,
  c.name as course_name
FROM exercises e
JOIN courses c ON e.course_id = c.id
WHERE e.course_id IN (
  SELECT DISTINCT course_id 
  FROM course_enrollments 
  WHERE status = 'active'
)
ORDER BY e.created_at DESC
LIMIT 20;

-- 4. Check exercise submissions
SELECT 
  es.id,
  es.exercise_id,
  es.student_id,
  es.score,
  es.submitted_at,
  es.auto_graded,
  es.completion_percentage,
  e.title as exercise_title,
  e.points as exercise_points,
  p.first_name,
  p.last_name
FROM exercise_submissions es
JOIN exercises e ON es.exercise_id = e.id
JOIN profiles p ON es.student_id = p.id
ORDER BY es.submitted_at DESC
LIMIT 20;

-- 5. Check if there are any course terms
SELECT 
  id,
  course_id,
  name,
  start_date,
  end_date,
  created_at
FROM course_terms
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check courses
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

-- 7. Test date calculation for a specific exercise and enrollment
-- Replace the UUIDs with actual values from your database
WITH test_data AS (
  SELECT 
    e.id as exercise_id,
    e.days_to_open,
    e.days_to_due,
    e.days_to_close,
    ce.student_id,
    ce.enrolled_at,
    ct.start_date as term_start_date,
    CASE 
      WHEN ct.start_date IS NOT NULL THEN ct.start_date
      ELSE ce.enrolled_at::date
    END as reference_start_date,
    CASE 
      WHEN ct.start_date IS NOT NULL THEN ct.start_date + (e.days_to_open || ' days')::interval
      ELSE ce.enrolled_at::date + (e.days_to_open || ' days')::interval
    END as calculated_open_date,
    CASE 
      WHEN ct.start_date IS NOT NULL THEN ct.start_date + ((e.days_to_open + e.days_to_due) || ' days')::interval
      ELSE ce.enrolled_at::date + ((e.days_to_open + e.days_to_due) || ' days')::interval
    END as calculated_due_date,
    CASE 
      WHEN ct.start_date IS NOT NULL THEN ct.start_date + (e.days_to_close || ' days')::interval
      ELSE ce.enrolled_at::date + (e.days_to_close || ' days')::interval
    END as calculated_close_date
  FROM exercises e
  JOIN course_enrollments ce ON e.course_id = ce.course_id
  LEFT JOIN course_terms ct ON ce.term_id = ct.id
  WHERE ce.status = 'active'
  LIMIT 5
)
SELECT 
  exercise_id,
  student_id,
  days_to_open,
  days_to_due,
  days_to_close,
  enrolled_at,
  term_start_date,
  reference_start_date,
  calculated_open_date,
  calculated_due_date,
  calculated_close_date,
  CURRENT_DATE as today,
  CASE 
    WHEN CURRENT_DATE >= calculated_open_date::date THEN 'OPEN'
    ELSE 'NOT_OPEN'
  END as open_status,
  CASE 
    WHEN CURRENT_DATE > calculated_close_date::date THEN 'OVERDUE'
    WHEN CURRENT_DATE >= calculated_open_date::date THEN 'ACTIVE'
    ELSE 'FUTURE'
  END as exercise_status
FROM test_data;

-- 8. Check for any exercises without course_id
SELECT 
  id,
  title,
  course_id,
  created_at
FROM exercises 
WHERE course_id IS NULL
ORDER BY created_at DESC;

-- 9. Check for any enrollments without valid courses
SELECT 
  ce.id,
  ce.course_id,
  ce.student_id,
  ce.status,
  c.name as course_name
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE c.id IS NULL
ORDER BY ce.enrolled_at DESC; 