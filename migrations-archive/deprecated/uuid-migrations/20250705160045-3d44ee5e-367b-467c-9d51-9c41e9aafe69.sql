-- Supabase Migration File
-- Create this file in your supabase/migrations directory
-- Example filename: 20250101000001_add_instruction_to_tasks.sql
begin;

-- Add instruction column to tasks table
alter table
  public.tasks
add
  column instruction text;

-- Add comment for documentation
comment on column public.tasks.instruction is 'Detailed instructions for completing the task';

-- If you want to set a default value (optional)
-- alter table public.tasks 
-- alter column instruction set default '';
-- Update any existing Row Level Security policies if needed
-- This is an example - adjust according to your actual RLS setup
-- Example: If you have a select policy that needs to include the new column
-- You typically don't need to modify RLS policies when adding columns,
-- but if you have column-specific restrictions, you might need updates
-- If you have any triggers or functions that work with the tasks table,
-- you might need to update them to handle the new instruction column
-- (This is optional and depends on your specific setup)
commit;