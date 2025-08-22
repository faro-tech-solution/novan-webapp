-- =====================================================
-- COURSE TERMS EXISTENCE CHECK SCRIPT
-- This script checks what course terms related objects exist
-- Run this first to see what needs to be cleaned up
-- =====================================================

-- 1. Check if course_terms table exists
SELECT 
    'course_terms table' as object_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_terms') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as status;

-- 2. Check if teacher_term_assignments table exists
SELECT 
    'teacher_term_assignments table' as object_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_term_assignments') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as status;

-- 3. Check if term_id column exists in course_enrollments
SELECT 
    'term_id column in course_enrollments' as object_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'course_enrollments' AND column_name = 'term_id'
        ) 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as status;

-- 4. Check for foreign key constraints
SELECT 
    'Foreign Key Constraints' as object_type,
    tc.constraint_name as constraint_name,
    tc.table_name as table_name,
    kcu.column_name as column_name,
    ccu.table_name AS referenced_table
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name IN ('course_terms', 'teacher_term_assignments')
       OR kcu.column_name = 'term_id');

-- 5. Check for indexes
SELECT 
    'Indexes' as object_type,
    indexname as index_name,
    tablename as table_name
FROM pg_indexes 
WHERE indexname LIKE '%term%' 
   OR indexname LIKE '%course_terms%'
   OR tablename IN ('course_terms', 'teacher_term_assignments');

-- 6. Check for triggers
SELECT 
    'Triggers' as object_type,
    trigger_name,
    event_object_table as table_name
FROM information_schema.triggers 
WHERE event_object_table IN ('course_terms', 'teacher_term_assignments');

-- 7. Check for RLS policies
SELECT 
    'RLS Policies' as object_type,
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('course_terms', 'teacher_term_assignments');

-- 8. Summary
SELECT 
    'SUMMARY' as object_type,
    COUNT(*) as count,
    'objects found' as description
FROM (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'course_terms'
    UNION ALL
    SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_term_assignments'
    UNION ALL
    SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'term_id'
) as all_objects;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
