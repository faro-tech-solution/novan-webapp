-- Simplified Dashboard RLS Policies
-- This migration creates simplified RLS policies for all tables needed by admin and trainer dashboards
-- These policies avoid infinite recursion by using simpler access patterns
-- Note: Profiles RLS policies are handled separately in 01_profiles_rls.sql

-- Exercise-related RLS policies have been moved to 03_exercises_rls.sql

-- Teacher assignment RLS policies have been moved to 02_courses_rls.sql

-- ========================================
-- AWARDS TABLE RLS POLICIES (SIMPLIFIED)
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

-- ========================================
-- STUDENT_AWARDS TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for student awards (needed for dashboards)
CREATE POLICY "Public can view student awards" ON student_awards
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Daily activities RLS policies have been moved to 08_activities_logs_rls.sql

-- ========================================
-- TASKS TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for tasks (needed for dashboards)
CREATE POLICY "Public can view tasks" ON tasks
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- SUBTASKS TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for subtasks (needed for dashboards)
CREATE POLICY "Public can view subtasks" ON subtasks
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- GROUPS TABLE RLS POLICIES (SIMPLIFIED)
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

-- ========================================
-- GROUP_MEMBERS TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for group members (needed for dashboards)
CREATE POLICY "Public can view group members" ON group_members
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Accounting RLS policies have been moved to 10_accounting_rls.sql

-- Notifications RLS policies have been moved to 09_notifications_rls.sql

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
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