-- Cleanup script for Dashboard RLS Policies
-- This script removes all existing dashboard RLS policies to prevent conflicts

-- ========================================
-- CLEANUP DASHBOARD RLS POLICIES
-- ========================================

-- Drop all policies from profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainers can view student profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profiles" ON profiles;

-- Drop all policies from exercises table
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Instructors can manage their exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage all exercises" ON exercises;
DROP POLICY IF EXISTS "Trainers can view assigned exercises" ON exercises;

-- Drop all policies from exercise_submissions table
DROP POLICY IF EXISTS "Students can view their submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can view course submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Trainers can view assigned submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can grade submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can grade all submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Public can view submissions" ON exercise_submissions;

-- Drop all policies from teacher_course_assignments table
DROP POLICY IF EXISTS "Teachers can view their assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Public can view assignments" ON teacher_course_assignments;

-- Drop all policies from awards table
DROP POLICY IF EXISTS "Users can view awards" ON awards;
DROP POLICY IF EXISTS "Admins can manage awards" ON awards;

-- Drop all policies from student_awards table
DROP POLICY IF EXISTS "Students can view their awards" ON student_awards;
DROP POLICY IF EXISTS "Admins can view all awards" ON student_awards;
DROP POLICY IF EXISTS "Trainers can view student awards" ON student_awards;
DROP POLICY IF EXISTS "Public can view student awards" ON student_awards;

-- Drop all policies from daily_activities table
DROP POLICY IF EXISTS "Users can view daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can manage daily activities" ON daily_activities;

-- Drop all policies from tasks table
DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Teammates can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Public can view tasks" ON tasks;

-- Drop all policies from subtasks table
DROP POLICY IF EXISTS "Users can view task subtasks" ON subtasks;
DROP POLICY IF EXISTS "Admins can manage all subtasks" ON subtasks;
DROP POLICY IF EXISTS "Public can view subtasks" ON subtasks;

-- Drop all policies from groups table
DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;

-- Drop all policies from group_members table
DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;
DROP POLICY IF EXISTS "Public can view group members" ON group_members;

-- Drop all policies from accounting table
DROP POLICY IF EXISTS "Users can view their accounting" ON accounting;
DROP POLICY IF EXISTS "Admins can view all accounting" ON accounting;
DROP POLICY IF EXISTS "Public can view accounting" ON accounting;

-- Drop all policies from notifications table
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Public can view notifications" ON notifications;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check that all dashboard policies have been removed
SELECT 
    tablename,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename IN (
    'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
    'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
    'groups', 'group_members', 'accounting', 'notifications'
)
GROUP BY tablename
ORDER BY tablename;

-- Show any remaining policies (should be 0)
SELECT 
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN (
    'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
    'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
    'groups', 'group_members', 'accounting', 'notifications'
)
ORDER BY tablename, policyname;

-- ========================================
-- SUMMARY
-- ========================================

DO $$
DECLARE
    remaining_count integer;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_policies 
    WHERE tablename IN (
        'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
        'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
        'groups', 'group_members', 'accounting', 'notifications'
    );
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ All dashboard RLS policies have been successfully removed!';
        RAISE NOTICE '✅ Ready to apply simplified dashboard RLS policies';
    ELSE
        RAISE NOTICE '⚠️  % dashboard RLS policies still remain', remaining_count;
        RAISE NOTICE '⚠️  Please check the list above and remove manually if needed';
    END IF;
END $$; 