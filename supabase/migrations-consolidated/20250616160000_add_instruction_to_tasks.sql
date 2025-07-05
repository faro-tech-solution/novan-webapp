-- Migration: Add instruction field to tasks table
-- Date: 2025-01-01
-- Description: Add instruction column to tasks table to store detailed instructions for each task
-- Add the instruction column to the tasks table
ALTER TABLE
  tasks
ADD
  COLUMN instruction TEXT;

-- Add a comment to document the new column
COMMENT ON COLUMN tasks.instruction IS 'Detailed instructions for the task';

-- Optional: Create an index if you plan to search through instructions frequently
-- CREATE INDEX CONCURRENTLY idx_tasks_instruction_search ON tasks USING gin(to_tsvector('english', instruction));
-- Update RLS (Row Level Security) policies if needed
-- Note: This assumes you already have RLS policies set up for the tasks table
-- If your existing policies don't cover the new column, you may need to update them
-- Example: If you have a policy that only allows certain columns to be read/updated,
-- you might need to update it to include the instruction column:
-- 
-- DROP POLICY IF EXISTS "policy_name" ON tasks;
-- CREATE POLICY "policy_name" ON tasks
--   FOR ALL 
--   TO authenticated
--   USING (/* your existing conditions */);
-- Verification query to check the column was added successfully
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' AND column_name = 'instruction';