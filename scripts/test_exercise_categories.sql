-- Test Exercise Categories Functionality
-- ======================================

-- Test 1: Check if exercise_categories table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exercise_categories'
ORDER BY ordinal_position;

-- Test 2: Check if category_id column was added to exercises table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exercises' 
AND column_name = 'category_id';

-- Test 3: Check if indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('exercise_categories', 'exercises')
AND indexname LIKE '%category%'
ORDER BY tablename, indexname;

-- Test 4: Check if RLS policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'exercise_categories'
ORDER BY policyname;

-- Test 5: Check if triggers were created
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%exercise_categories%'
ORDER BY trigger_name;

-- Test 6: Sample data insertion test (if you have a course)
-- Uncomment and modify the course_id if you want to test with real data
/*
INSERT INTO exercise_categories (
    name,
    description,
    course_id,
    order_index,
    created_by
) VALUES (
    'تمرینات پایه',
    'تمرینات مقدماتی برای شروع دوره',
    'your-course-id-here',
    0,
    'your-user-id-here'
) ON CONFLICT (course_id, name) DO NOTHING;

-- Check if the category was created
SELECT * FROM exercise_categories WHERE name = 'تمرینات پایه';
*/

-- Test 7: Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'exercise_categories' OR tc.table_name = 'exercises')
AND (kcu.column_name = 'course_id' OR kcu.column_name = 'category_id');

-- Summary
SELECT 
    'Exercise Categories Migration Test Results' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_categories') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as table_created,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'category_id') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as column_added,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exercise_categories_course_id') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as indexes_created,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exercise_categories') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as rls_policies_created; 