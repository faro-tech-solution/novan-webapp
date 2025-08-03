-- Cleanup Tasks and Teammate System
-- This script removes all task-related tables and teammate functionality

-- Drop task-related tables in the correct order (due to foreign key constraints)
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Remove any task-related RLS policies (if they still exist)
DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Teammates can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Public can view tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view task subtasks" ON subtasks;
DROP POLICY IF EXISTS "Admins can manage all subtasks" ON subtasks;

-- Remove any task-related triggers (if they exist)
DROP TRIGGER IF EXISTS set_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS set_updated_at ON subtasks;
DROP TRIGGER IF EXISTS update_subtasks_updated_at ON subtasks;

-- Remove any task-related functions (if they exist)
DROP FUNCTION IF EXISTS get_task_stats() CASCADE;
DROP FUNCTION IF EXISTS get_user_tasks(UUID) CASCADE;

-- Update profiles table to remove teammate role references
-- First, update any existing teammate users to a different role (e.g., trainee)
UPDATE profiles SET role = 'trainee' WHERE role = 'teammate';

-- Remove teammate role from the role enum (if it exists as a custom type)
-- Note: This might need to be done manually depending on your database setup
-- ALTER TYPE role_enum DROP VALUE 'teammate';

-- Note: This script should be run carefully as it permanently removes all task data
-- Make sure to backup any important data before running this script 