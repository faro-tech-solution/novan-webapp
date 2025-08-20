-- Cleanup: Remove sort field from exercises table
-- This script removes the deprecated sort field since we now use order_index

-- Step 1: Drop the sort column
ALTER TABLE exercises DROP COLUMN IF EXISTS sort;

-- Step 2: Drop the sort index if it exists
DROP INDEX IF EXISTS idx_exercises_sort;
DROP INDEX IF EXISTS idx_exercises_sort_created_at;

-- Step 3: Verify the cleanup
SELECT 
  'Sort field cleanup completed!' as status,
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN order_index IS NOT NULL THEN 1 END) as exercises_with_order_index
FROM exercises;

-- Step 4: Show current table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'exercises' 
AND table_schema = 'public'
ORDER BY ordinal_position;
