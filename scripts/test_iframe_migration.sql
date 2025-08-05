-- Test script to check if iframe_html column exists
-- Run this to verify the database state

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exercises' 
AND column_name IN ('iframe_html', 'exercise_type')
ORDER BY column_name;

-- Check the current exercise_type constraint
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'exercises_exercise_type_check'; 