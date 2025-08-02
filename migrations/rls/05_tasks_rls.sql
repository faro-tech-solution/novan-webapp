-- 05_tasks_rls.sql
-- Consolidated RLS policies for Tasks system
-- Tables: tasks, subtasks

-- ========================================
-- TASKS TABLE RLS POLICIES
-- ========================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Teammates can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Public can view tasks" ON tasks;
DROP POLICY IF EXISTS "Teammates can update their tasks" ON tasks;

-- Users can view their assigned tasks
CREATE POLICY "Users can view their tasks" ON tasks
FOR SELECT USING (
  assigned_to = auth.uid()
);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks" ON tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Teammates can view their tasks
CREATE POLICY "Teammates can view their tasks" ON tasks
FOR SELECT USING (
  assigned_to = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teammate'
  )
);

-- Public can view tasks (for dashboards)
CREATE POLICY "Public can view tasks" ON tasks
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- SUBTASKS TABLE RLS POLICIES
-- ========================================
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view task subtasks" ON subtasks;
DROP POLICY IF EXISTS "Admins can manage all subtasks" ON subtasks;
DROP POLICY IF EXISTS "Public can view subtasks" ON subtasks;
DROP POLICY IF EXISTS "Teammates can update their subtasks" ON subtasks;
DROP POLICY IF EXISTS "Teammates can view their subtasks" ON subtasks;

-- Users can view subtasks for their tasks
CREATE POLICY "Users can view task subtasks" ON subtasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = subtasks.task_id
    AND t.assigned_to = auth.uid()
  )
);

-- Admins can manage all subtasks
CREATE POLICY "Admins can manage all subtasks" ON subtasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Public can view subtasks (for dashboards)
CREATE POLICY "Public can view subtasks" ON subtasks
FOR SELECT USING (
  auth.role() = 'authenticated'
); 