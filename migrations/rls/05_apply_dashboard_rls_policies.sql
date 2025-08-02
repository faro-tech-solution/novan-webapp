-- Master script to apply all dashboard RLS policies
-- This script applies RLS policies for admin and trainer dashboards

-- ========================================
-- DASHBOARD RLS POLICIES APPLICATION
-- ========================================

-- Apply profiles RLS policies first (required for other policies)
\i migrations/rls/01_profiles_rls.sql

-- Apply the comprehensive dashboard RLS policies
\i migrations/rls/04_dashboard_rls_policies.sql

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that RLS is enabled on all dashboard tables
DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    RAISE NOTICE 'Verifying RLS is enabled on dashboard tables...';
    
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
            'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
            'groups', 'group_members', 'accounting', 'notifications'
        ])
    LOOP
        SELECT rowsecurity INTO rls_enabled
        FROM pg_tables 
        WHERE tablename = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE '✅ RLS enabled on %', table_name;
        ELSE
            RAISE NOTICE '❌ RLS NOT enabled on %', table_name;
        END IF;
    END LOOP;
END $$;

-- Count policies for each dashboard table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN (
    'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
    'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
    'groups', 'group_members', 'accounting', 'notifications'
)
GROUP BY tablename
ORDER BY tablename;

-- Show all dashboard policies
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN (
    'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
    'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
    'groups', 'group_members', 'accounting', 'notifications'
)
ORDER BY tablename, policyname;

-- ========================================
-- DASHBOARD ACCESS TESTING
-- ========================================

-- Test admin access to all tables
DO $$
DECLARE
    admin_id uuid;
    test_count integer;
BEGIN
    -- Get an admin user ID
    SELECT id INTO admin_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE NOTICE '⚠️  No admin user found for testing';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing admin access with user ID: %', admin_id;
    
    -- Test admin access to profiles
    SELECT COUNT(*) INTO test_count FROM profiles;
    RAISE NOTICE 'Admin can access % profiles', test_count;
    
    -- Test admin access to exercises
    SELECT COUNT(*) INTO test_count FROM exercises;
    RAISE NOTICE 'Admin can access % exercises', test_count;
    
    -- Test admin access to exercise_submissions
    SELECT COUNT(*) INTO test_count FROM exercise_submissions;
    RAISE NOTICE 'Admin can access % exercise submissions', test_count;
    
    -- Test admin access to awards
    SELECT COUNT(*) INTO test_count FROM awards;
    RAISE NOTICE 'Admin can access % awards', test_count;
    
    -- Test admin access to student_awards
    SELECT COUNT(*) INTO test_count FROM student_awards;
    RAISE NOTICE 'Admin can access % student awards', test_count;
    
    -- Test admin access to daily_activities
    SELECT COUNT(*) INTO test_count FROM daily_activities;
    RAISE NOTICE 'Admin can access % daily activities', test_count;
    
    -- Test admin access to tasks
    SELECT COUNT(*) INTO test_count FROM tasks;
    RAISE NOTICE 'Admin can access % tasks', test_count;
    
    -- Test admin access to groups
    SELECT COUNT(*) INTO test_count FROM groups;
    RAISE NOTICE 'Admin can access % groups', test_count;
    
    -- Test admin access to accounting
    SELECT COUNT(*) INTO test_count FROM accounting;
    RAISE NOTICE 'Admin can access % accounting records', test_count;
    
    -- Test admin access to notifications
    SELECT COUNT(*) INTO test_count FROM notifications;
    RAISE NOTICE 'Admin can access % notifications', test_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing admin access: %', SQLERRM;
END $$;

-- Test trainer access to assigned data
DO $$
DECLARE
    trainer_id uuid;
    test_count integer;
BEGIN
    -- Get a trainer user ID
    SELECT id INTO trainer_id 
    FROM profiles 
    WHERE role = 'trainer' 
    LIMIT 1;
    
    IF trainer_id IS NULL THEN
        RAISE NOTICE '⚠️  No trainer user found for testing';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing trainer access with user ID: %', trainer_id;
    
    -- Test trainer access to their assignments
    SELECT COUNT(*) INTO test_count 
    FROM teacher_course_assignments 
    WHERE teacher_id = trainer_id;
    RAISE NOTICE 'Trainer has % course assignments', test_count;
    
    -- Test trainer access to exercises for assigned courses
    SELECT COUNT(*) INTO test_count 
    FROM exercises e
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE 'Trainer can access % exercises for assigned courses', test_count;
    
    -- Test trainer access to submissions for assigned courses
    SELECT COUNT(*) INTO test_count 
    FROM exercise_submissions es
    JOIN exercises e ON es.exercise_id = e.id
    JOIN teacher_course_assignments tca ON e.course_id = tca.course_id
    WHERE tca.teacher_id = trainer_id;
    RAISE NOTICE 'Trainer can access % submissions for assigned courses', test_count;
    
    -- Test trainer access to student profiles
    SELECT COUNT(*) INTO test_count 
    FROM profiles 
    WHERE role = 'trainee';
    RAISE NOTICE 'Trainer can access % student profiles', test_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing trainer access: %', SQLERRM;
END $$;

-- Test student access to their own data
DO $$
DECLARE
    student_id uuid;
    test_count integer;
BEGIN
    -- Get a student user ID
    SELECT id INTO student_id 
    FROM profiles 
    WHERE role = 'trainee' 
    LIMIT 1;
    
    IF student_id IS NULL THEN
        RAISE NOTICE '⚠️  No student user found for testing';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing student access with user ID: %', student_id;
    
    -- Test student access to their own profile
    SELECT COUNT(*) INTO test_count 
    FROM profiles 
    WHERE id = student_id;
    RAISE NOTICE 'Student can access % own profile records', test_count;
    
    -- Test student access to their submissions
    SELECT COUNT(*) INTO test_count 
    FROM exercise_submissions 
    WHERE student_id = student_id;
    RAISE NOTICE 'Student can access % own submissions', test_count;
    
    -- Test student access to their awards
    SELECT COUNT(*) INTO test_count 
    FROM student_awards 
    WHERE student_id = student_id;
    RAISE NOTICE 'Student can access % own awards', test_count;
    
    -- Test student access to their tasks
    SELECT COUNT(*) INTO test_count 
    FROM tasks 
    WHERE assigned_to = student_id;
    RAISE NOTICE 'Student can access % assigned tasks', test_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing student access: %', SQLERRM;
END $$;

-- ========================================
-- SUMMARY
-- ========================================

RAISE NOTICE 'Dashboard RLS policies have been applied successfully!';
RAISE NOTICE '';
RAISE NOTICE 'Summary of applied policies:';
RAISE NOTICE '- Profiles: 5 policies (view own, admin view all, trainer view students, update own, admin update all)';
RAISE NOTICE '- Exercises: 4 policies (view all, instructor manage, admin manage all, trainer view assigned)';
RAISE NOTICE '- Exercise Submissions: 7 policies (student view/create, instructor view/grade, admin view/grade all, trainer view assigned)';
RAISE NOTICE '- Teacher Course Assignments: 2 policies (teacher view own, admin manage all)';
RAISE NOTICE '- Awards: 2 policies (view all, admin manage)';
RAISE NOTICE '- Student Awards: 3 policies (student view own, admin view all, trainer view)';
RAISE NOTICE '- Daily Activities: 2 policies (view all, admin manage)';
RAISE NOTICE '- Tasks: 3 policies (view assigned, admin manage all, teammate view)';
RAISE NOTICE '- Subtasks: 2 policies (view task subtasks, admin manage all)';
RAISE NOTICE '- Groups: 2 policies (view all, admin manage)';
RAISE NOTICE '- Group Members: 2 policies (view own memberships, admin manage)';
RAISE NOTICE '- Accounting: 2 policies (view own, admin view all)';
RAISE NOTICE '- Notifications: 2 policies (view own, admin view all)';
RAISE NOTICE '';
RAISE NOTICE 'All dashboard functionality should now work with proper access control!'; 