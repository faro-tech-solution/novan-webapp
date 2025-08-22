-- =====================================================
-- COURSE TERMS MIGRATION CLEANUP SCRIPT
-- This script updates the database schema after removing course terms
-- =====================================================

-- 1. Update course_enrollments table structure
-- Remove any remaining term-related constraints or indexes
DROP INDEX IF EXISTS idx_course_enrollments_term_id;

-- 2. Verify the current structure of course_enrollments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_enrollments'
ORDER BY ordinal_position;

-- 3. Update any views that might reference course_terms
-- (This will depend on your specific database setup)

-- 4. Clean up any remaining references in functions or procedures
-- (This will be handled when the tables are dropped)

-- 5. Verify no remaining foreign key references
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name IN ('course_terms', 'teacher_term_assignments')
       OR kcu.column_name = 'term_id');

-- =====================================================
-- MIGRATION CLEANUP COMPLETE
-- =====================================================
