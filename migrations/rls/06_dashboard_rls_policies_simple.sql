-- Simplified Dashboard RLS Policies
-- This migration creates simplified RLS policies for all tables needed by admin and trainer dashboards
-- These policies avoid infinite recursion by using simpler access patterns

-- ========================================
-- PROFILES TABLE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainers can view student profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id
);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

-- Policy 3: Public read access for basic profile info (needed for dashboards)
CREATE POLICY "Public can view basic profiles" ON profiles
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- EXERCISES TABLE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Enable RLS on exercises table if not already enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Instructors can manage their exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage all exercises" ON exercises;
DROP POLICY IF EXISTS "Trainers can view assigned exercises" ON exercises;

-- Policy 1: Users can view exercises (needed for dashboards)
CREATE POLICY "Users can view exercises" ON exercises
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Policy 2: Instructors can manage their exercises
CREATE POLICY "Instructors can manage their exercises" ON exercises
FOR ALL USING (
  created_by = auth.uid()
) WITH CHECK (
  created_by = auth.uid()
);

-- ========================================
-- EXERCISE_SUBMISSIONS TABLE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Enable RLS on exercise_submissions table if not already enabled
ALTER TABLE exercise_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can view course submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Trainers can view assigned submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can grade submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can grade all submissions" ON exercise_submissions;

-- Policy 1: Students can view their own submissions
CREATE POLICY "Students can view their submissions" ON exercise_submissions
FOR SELECT USING (
  student_id = auth.uid()
);

-- Policy 2: Students can create submissions
CREATE POLICY "Students can create submissions" ON exercise_submissions
FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- Policy 3: Instructors can view submissions for their exercises
CREATE POLICY "Instructors can view course submissions" ON exercise_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
);

-- Policy 4: Instructors can grade submissions for their exercises
CREATE POLICY "Instructors can grade submissions" ON exercise_submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
);

-- Policy 5: Public read access for submissions (needed for dashboards)
CREATE POLICY "Public can view submissions" ON exercise_submissions
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- TEACHER_COURSE_ASSIGNMENTS TABLE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Enable RLS on teacher_course_assignments table if not already enabled
ALTER TABLE teacher_course_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their assignments" ON teacher_course_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON teacher_course_assignments;

-- Policy 1: Teachers can view their own assignments
CREATE POLICY "Teachers can view their assignments" ON teacher_course_assignments
FOR SELECT USING (
  teacher_id = auth.uid()
);

-- Policy 2: Public read access for assignments (needed for dashboards)
CREATE POLICY "Public can view assignments" ON teacher_course_assignments
FOR SELECT USING (
  auth.role() = 'authenticated'
);

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

-- ========================================
-- DAILY_ACTIVITIES TABLE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Enable RLS on daily_activities table if not already enabled
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can manage daily activities" ON daily_activities;

-- Policy 1: Users can view daily activities (needed for dashboards)
CREATE POLICY "Users can view daily activities" ON daily_activities
FOR SELECT USING (
  auth.role() = 'authenticated'
);

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

-- ========================================
-- ACCOUNTING TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for accounting (needed for dashboards)
CREATE POLICY "Public can view accounting" ON accounting
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- NOTIFICATIONS TABLE RLS POLICIES (SIMPLIFIED)
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

-- Policy 2: Public read access for notifications (needed for dashboards)
CREATE POLICY "Public can view notifications" ON notifications
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Create indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_course_id ON exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_student_id ON exercise_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_exercise_id ON exercise_submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_teacher_id ON teacher_course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_course_id ON teacher_course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_awards_student_id ON student_awards(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_accounting_user_id ON accounting(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON notifications(receiver_id);

-- Verify RLS is enabled for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN (
  'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
  'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
  'groups', 'group_members', 'accounting', 'notifications'
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
  'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
  'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
  'groups', 'group_members', 'accounting', 'notifications'
)
ORDER BY tablename, policyname; 