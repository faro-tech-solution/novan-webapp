-- Allow teammates to update their own assigned tasks
CREATE POLICY "Teammates can update their tasks"
  ON tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
  );

-- Allow teammates to update their subtasks if the parent task is assigned to them
CREATE POLICY "Teammates can update their subtasks"
  ON subtasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
        AND tasks.assigned_to = auth.uid()
    )
  ); 