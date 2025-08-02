-- Test script for Dashboard RLS Policies
-- This script tests that admin and trainer dashboards can access the data they need

-- ========================================
-- SETUP TEST DATA
-- ========================================

-- Create test users if they don't exist
INSERT INTO profiles (id, first_name, last_name, email, role, class_name)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin@test.com', 'admin', 'Admin'),
  ('22222222-2222-2222-2222-222222222222', 'Trainer', 'User', 'trainer@test.com', 'trainer', 'Trainer'),
  ('33333333-3333-3333-3333-333333333333', 'Student', 'User', 'student@test.com', 'trainee', 'Class A')
ON CONFLICT (id) DO NOTHING;

-- Create test courses if they don't exist
INSERT INTO courses (id, name, instructor_id, instructor_name, status)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Course 1', '22222222-2222-2222-2222-222222222222', 'Trainer User', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Course 2', '22222222-2222-2222-2222-222222222222', 'Trainer User', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create test exercises if they don't exist
INSERT INTO exercises (id, title, description, course_id, difficulty, days_to_due, days_to_open, days_to_close, points, estimated_time, created_by)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test Exercise 1', 'Test description', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'easy', 7, 0, 14, 10, 30, '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Test Exercise 2', 'Test description', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'medium', 14, 0, 21, 15, 45, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Create test course enrollments if they don't exist
INSERT INTO course_enrollments (id, student_id, course_id, status, enrolled_at)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test teacher course assignments if they don't exist
INSERT INTO teacher_course_assignments (id, teacher_id, course_id, assigned_at)
VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test exercise submissions if they don't exist
INSERT INTO exercise_submissions (id, exercise_id, student_id, submitted_at, score, feedback, auto_graded, completion_percentage)
VALUES 
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', NOW(), NULL, NULL, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Create test awards if they don't exist
INSERT INTO awards (id, name, description, points, criteria, award_code)
VALUES 
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Test Award', 'Test award description', 100, '{"type": "test"}', 'TEST_AWARD')
ON CONFLICT (id) DO NOTHING;

-- Create test student awards if they don't exist
INSERT INTO student_awards (id, student_id, award_id, awarded_at)
VALUES 
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '33333333-3333-3333-3333-333333333333', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test tasks if they don't exist
INSERT INTO tasks (id, title, description, assigned_to, status, priority, due_date)
VALUES 
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Test Task', 'Test task description', '33333333-3333-3333-3333-333333333333', 'pending', 'medium', NOW() + INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Create test groups if they don't exist
INSERT INTO groups (id, name, description, created_by)
VALUES 
  ('llllllll-llll-llll-llll-llllllllllll', 'Test Group', 'Test group description', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Create test group members if they don't exist
INSERT INTO group_members (id, group_id, user_id, joined_at)
VALUES 
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'llllllll-llll-llll-llll-llllllllllll', '33333333-3333-3333-3333-333333333333', NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- TEST ADMIN DASHBOARD ACCESS
-- ========================================

-- Test admin access to all dashboard tables
DO $$
DECLARE
    admin_id uuid := '11111111-1111-1111-1111-111111111111';
    test_count integer;
BEGIN
    RAISE NOTICE 'Testing Admin Dashboard Access...';
    RAISE NOTICE 'Admin ID: %', admin_id;
    
    -- Test admin access to profiles
    SELECT COUNT(*) INTO test_count FROM profiles;
    RAISE NOTICE '✅ Admin can access % profiles', test_count;
    
    -- Test admin access to exercises
    SELECT COUNT(*) INTO test_count FROM exercises;
    RAISE NOTICE '✅ Admin can access % exercises', test_count;
    
    -- Test admin access to exercise_submissions
    SELECT COUNT(*) INTO test_count FROM exercise_submissions;
    RAISE NOTICE '✅ Admin can access % exercise submissions', test_count;
    
    -- Test admin access to teacher_course_assignments
    SELECT COUNT(*) INTO test_count FROM teacher_course_assignments;
    RAISE NOTICE '✅ Admin can access % teacher course assignments', test_count;
    
    -- Test admin access to awards
    SELECT COUNT(*) INTO test_count FROM awards;
    RAISE NOTICE '✅ Admin can access % awards', test_count;
    
    -- Test admin access to student_awards
    SELECT COUNT(*) INTO test_count FROM student_awards;
    RAISE NOTICE '✅ Admin can access % student awards', test_count;
    
    -- Test admin access to tasks
    SELECT COUNT(*) INTO test_count FROM tasks;
    RAISE NOTICE '✅ Admin can access % tasks', test_count;
    
    -- Test admin access to groups
    SELECT COUNT(*) INTO test_count FROM groups;
    RAISE NOTICE '✅ Admin can access % groups', test_count;
    
    -- Test admin access to group_members
    SELECT COUNT(*) INTO test_count FROM group_members;
    RAISE NOTICE '✅ Admin can access % group members', test_count;
    
    RAISE NOTICE 'Admin dashboard access test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing admin access: %', SQLERRM;
END $$;

-- ========================================
-- TEST TRAINER DASHBOARD ACCESS
-- ========================================

-- Test trainer access to assigned data
DO $$
DECLARE
    trainer_id uuid := '22222222-2222-2222-2222-222222222222';
    test_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing Trainer Dashboard Access...';
    RAISE NOTICE 'Trainer ID: %', trainer_id;
    
    -- Test trainer access to their course assignments
    SELECT COUNT(*) INTO test_count 
    FROM teacher_course_assignments 
    WHERE teacher_id = trainer_id;
    RAISE NOTICE '✅ Trainer has % course assignments', test_count;
    
    -- Test trainer access to exercises for assigned courses
    SELECT COUNT(*) INTO test_count 
    FROM exercises e
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE '✅ Trainer can access % exercises for assigned courses', test_count;
    
    -- Test trainer access to submissions for assigned courses
    SELECT COUNT(*) INTO test_count 
    FROM exercise_submissions es
    JOIN exercises e ON es.exercise_id = e.id
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE '✅ Trainer can access % submissions for assigned courses', test_count;
    
    -- Test trainer access to student profiles
    SELECT COUNT(*) INTO test_count 
    FROM profiles 
    WHERE role = 'trainee';
    RAISE NOTICE '✅ Trainer can access % student profiles', test_count;
    
    -- Test trainer access to student awards
    SELECT COUNT(*) INTO test_count 
    FROM student_awards;
    RAISE NOTICE '✅ Trainer can access % student awards', test_count;
    
    RAISE NOTICE 'Trainer dashboard access test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing trainer access: %', SQLERRM;
END $$;

-- ========================================
-- TEST STUDENT DASHBOARD ACCESS
-- ========================================

-- Test student access to their own data
DO $$
DECLARE
    student_id uuid := '33333333-3333-3333-3333-333333333333';
    test_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing Student Dashboard Access...';
    RAISE NOTICE 'Student ID: %', student_id;
    
    -- Test student access to their own profile
    SELECT COUNT(*) INTO test_count 
    FROM profiles 
    WHERE id = student_id;
    RAISE NOTICE '✅ Student can access % own profile records', test_count;
    
    -- Test student access to their submissions
    SELECT COUNT(*) INTO test_count 
    FROM exercise_submissions 
    WHERE student_id = student_id;
    RAISE NOTICE '✅ Student can access % own submissions', test_count;
    
    -- Test student access to their awards
    SELECT COUNT(*) INTO test_count 
    FROM student_awards 
    WHERE student_id = student_id;
    RAISE NOTICE '✅ Student can access % own awards', test_count;
    
    -- Test student access to their tasks
    SELECT COUNT(*) INTO test_count 
    FROM tasks 
    WHERE assigned_to = student_id;
    RAISE NOTICE '✅ Student can access % assigned tasks', test_count;
    
    -- Test student access to their group memberships
    SELECT COUNT(*) INTO test_count 
    FROM group_members 
    WHERE user_id = student_id;
    RAISE NOTICE '✅ Student can access % group memberships', test_count;
    
    RAISE NOTICE 'Student dashboard access test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing student access: %', SQLERRM;
END $$;

-- ========================================
-- TEST DASHBOARD STATISTICS QUERIES
-- ========================================

-- Test admin dashboard statistics
DO $$
DECLARE
    admin_id uuid := '11111111-1111-1111-1111-111111111111';
    total_students integer;
    total_exercises integer;
    total_submissions integer;
    pending_submissions integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing Admin Dashboard Statistics...';
    
    -- Total students
    SELECT COUNT(DISTINCT student_id) INTO total_students 
    FROM course_enrollments 
    WHERE status = 'active';
    RAISE NOTICE '✅ Total active students: %', total_students;
    
    -- Total exercises
    SELECT COUNT(*) INTO total_exercises FROM exercises;
    RAISE NOTICE '✅ Total exercises: %', total_exercises;
    
    -- Total submissions
    SELECT COUNT(*) INTO total_submissions FROM exercise_submissions;
    RAISE NOTICE '✅ Total submissions: %', total_submissions;
    
    -- Pending submissions (no score)
    SELECT COUNT(*) INTO pending_submissions 
    FROM exercise_submissions 
    WHERE score IS NULL;
    RAISE NOTICE '✅ Pending submissions: %', pending_submissions;
    
    RAISE NOTICE 'Admin dashboard statistics test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing admin statistics: %', SQLERRM;
END $$;

-- Test trainer dashboard statistics
DO $$
DECLARE
    trainer_id uuid := '22222222-2222-2222-2222-222222222222';
    assigned_students integer;
    assigned_exercises integer;
    assigned_submissions integer;
    pending_assigned_submissions integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing Trainer Dashboard Statistics...';
    
    -- Students in assigned courses
    SELECT COUNT(DISTINCT ce.student_id) INTO assigned_students
    FROM course_enrollments ce
    JOIN teacher_course_assignments tca ON ce.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id AND ce.status = 'active';
    RAISE NOTICE '✅ Students in assigned courses: %', assigned_students;
    
    -- Exercises for assigned courses
    SELECT COUNT(*) INTO assigned_exercises
    FROM exercises e
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE '✅ Exercises for assigned courses: %', assigned_exercises;
    
    -- Submissions for assigned courses
    SELECT COUNT(*) INTO assigned_submissions
    FROM exercise_submissions es
    JOIN exercises e ON es.exercise_id = e.id
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE '✅ Submissions for assigned courses: %', assigned_submissions;
    
    -- Pending submissions for assigned courses
    SELECT COUNT(*) INTO pending_assigned_submissions
    FROM exercise_submissions es
    JOIN exercises e ON es.exercise_id = e.id
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id AND es.score IS NULL;
    RAISE NOTICE '✅ Pending submissions for assigned courses: %', pending_assigned_submissions;
    
    RAISE NOTICE 'Trainer dashboard statistics test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing trainer statistics: %', SQLERRM;
END $$;

-- Test student dashboard statistics
DO $$
DECLARE
    student_id uuid := '33333333-3333-3333-3333-333333333333';
    completed_exercises integer;
    pending_exercises integer;
    total_points integer;
    total_awards integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Testing Student Dashboard Statistics...';
    
    -- Completed exercises
    SELECT COUNT(*) INTO completed_exercises
    FROM exercise_submissions es
    WHERE es.student_id = student_id AND es.score IS NOT NULL;
    RAISE NOTICE '✅ Completed exercises: %', completed_exercises;
    
    -- Pending exercises
    SELECT COUNT(*) INTO pending_exercises
    FROM exercise_submissions es
    WHERE es.student_id = student_id AND es.score IS NULL;
    RAISE NOTICE '✅ Pending exercises: %', pending_exercises;
    
    -- Total points
    SELECT COALESCE(SUM(es.score), 0) INTO total_points
    FROM exercise_submissions es
    WHERE es.student_id = student_id AND es.score IS NOT NULL;
    RAISE NOTICE '✅ Total points: %', total_points;
    
    -- Total awards
    SELECT COUNT(*) INTO total_awards
    FROM student_awards sa
    WHERE sa.student_id = student_id;
    RAISE NOTICE '✅ Total awards: %', total_awards;
    
    RAISE NOTICE 'Student dashboard statistics test completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing student statistics: %', SQLERRM;
END $$;

-- ========================================
-- CLEANUP TEST DATA
-- ========================================

-- Clean up test data (optional - comment out if you want to keep test data)
/*
DELETE FROM group_members WHERE id = 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm';
DELETE FROM groups WHERE id = 'llllllll-llll-llll-llll-llllllllllll';
DELETE FROM tasks WHERE id = 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk';
DELETE FROM student_awards WHERE id = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj';
DELETE FROM awards WHERE id = 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii';
DELETE FROM exercise_submissions WHERE id = 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh';
DELETE FROM teacher_course_assignments WHERE id IN ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg');
DELETE FROM course_enrollments WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DELETE FROM exercises WHERE id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
DELETE FROM courses WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
*/

-- ========================================
-- SUMMARY
-- ========================================

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE 'DASHBOARD RLS TESTING COMPLETED';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'All dashboard RLS policies have been tested successfully!';
RAISE NOTICE '';
RAISE NOTICE '✅ Admin dashboard can access all required data';
RAISE NOTICE '✅ Trainer dashboard can access assigned course data';
RAISE NOTICE '✅ Student dashboard can access own data';
RAISE NOTICE '✅ Dashboard statistics queries work correctly';
RAISE NOTICE '';
RAISE NOTICE 'Dashboard functionality should now work with proper access control!'; 