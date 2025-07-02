-- Rollback Migration: Remove instruction field from tasks table
-- Date: 2025-01-01
-- Description: Rollback migration to remove the instruction column from tasks table
-- Remove the instruction column from the tasks table
ALTER TABLE
  tasks DROP COLUMN IF EXISTS instruction;

-- Verification query to check the column was removed successfully
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' AND column_name = 'instruction';