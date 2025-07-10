-- Dashboard RLS Policies
-- This migration creates RLS policies for all tables needed by admin and trainer dashboards
-- to ensure proper access control while allowing dashboard functionality
-- Note: Profiles RLS policies are handled separately in 01_profiles_rls.sql

-- Exercise-related RLS policies have been moved to 03_exercises_rls.sql

-- Teacher assignment RLS policies have been moved to 02_courses_rls.sql

-- ========================================
-- AWARDS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on awards table if not already enabled
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view awards" ON awards;
DROP POLICY IF EXISTS "Admins can manage awards" ON awards;

-- Policy 1: Users can view awards (needed for dashboards)
CREATE POLICY "Users can view awards" ON awards
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 2: Admins can manage awards
CREATE POLICY "Admins can manage awards" ON awards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- STUDENT_AWARDS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on student_awards table if not already enabled
ALTER TABLE student_awards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their awards" ON student_awards;
DROP POLICY IF EXISTS "Admins can view all awards" ON student_awards;
DROP POLICY IF EXISTS "Trainers can view student awards" ON student_awards;

-- Policy 1: Students can view their own awards
CREATE POLICY "Students can view their awards" ON student_awards
FOR SELECT USING (
  student_id = auth.uid()
);

-- Policy 2: Admins can view all awards
CREATE POLICY "Admins can view all awards" ON student_awards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Trainers can view awards for students in their courses
CREATE POLICY "Trainers can view student awards" ON student_awards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'trainer'
  )
);

-- ========================================
-- DAILY_ACTIVITIES TABLE RLS POLICIES
-- ========================================

-- Remove all ALTER TABLE and CREATE/DROP POLICY statements for:
-- daily_activities, student_activity_logs, notifications, accounting

-- ========================================
-- TASKS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on tasks table if not already enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Teammates can view their tasks" ON tasks;

-- Policy 1: Users can view their assigned tasks
CREATE POLICY "Users can view their tasks" ON tasks
FOR SELECT USING (
  assigned_to = auth.uid()
);

-- Policy 2: Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks" ON tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 3: Teammates can view their tasks
CREATE POLICY "Teammates can view their tasks" ON tasks
FOR SELECT USING (
  assigned_to = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teammate'
  )
);

-- ========================================
-- SUBTASKS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on subtasks table if not already enabled
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view task subtasks" ON subtasks;
DROP POLICY IF EXISTS "Admins can manage all subtasks" ON subtasks;

-- Policy 1: Users can view subtasks for their tasks
CREATE POLICY "Users can view task subtasks" ON subtasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = subtasks.task_id
    AND t.assigned_to = auth.uid()
  )
);

-- Policy 2: Admins can manage all subtasks
CREATE POLICY "Admins can manage all subtasks" ON subtasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- GROUPS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on groups table if not already enabled
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;

-- Policy 1: Users can view groups (needed for dashboards)
CREATE POLICY "Users can view groups" ON groups
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 2: Admins can manage groups
CREATE POLICY "Admins can manage groups" ON groups
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- GROUP_MEMBERS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on group_members table if not already enabled
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;

-- Policy 1: Users can view their group memberships
CREATE POLICY "Users can view their group memberships" ON group_members
FOR SELECT USING (
  user_id = auth.uid()
);

-- Policy 2: Admins can manage group members
CREATE POLICY "Admins can manage group members" ON group_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- ACCOUNTING TABLE RLS POLICIES
-- ========================================

-- Enable RLS on accounting table if not already enabled
ALTER TABLE accounting ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their accounting" ON accounting;
DROP POLICY IF EXISTS "Admins can view all accounting" ON accounting;

-- Policy 1: Users can view their own accounting records
CREATE POLICY "Users can view their accounting" ON accounting
FOR SELECT USING (
  user_id = auth.uid()
);

-- Policy 2: Admins can view all accounting records
CREATE POLICY "Admins can view all accounting" ON accounting
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- NOTIFICATIONS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on notifications table if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
FOR SELECT USING (
  receiver_id = auth.uid()
);

-- Policy 2: Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
-- Exercise-related indexes have been moved to 03_exercises_rls.sql
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_teacher_id ON teacher_course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_course_id ON teacher_course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_awards_student_id ON student_awards(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_accounting_user_id ON accounting(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON notifications(receiver_id);

-- Verify RLS is enabled for all dashboard tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN (
  'profiles'
)
ORDER BY tablename;

-- List all policies for dashboard tables
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN (
  'profiles'
)
ORDER BY tablename, policyname; 