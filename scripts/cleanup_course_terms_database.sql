-- =====================================================
-- COURSE TERMS DATABASE CLEANUP SCRIPT
-- This script removes all course terms related database objects
-- =====================================================

-- 1. Drop foreign key constraints first (only if tables exist)
DO $$
BEGIN
    -- Drop constraint from course_enrollments if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_enrollments_term_id_fkey'
    ) THEN
        ALTER TABLE course_enrollments DROP CONSTRAINT course_enrollments_term_id_fkey;
        RAISE NOTICE 'Dropped constraint: course_enrollments_term_id_fkey';
    ELSE
        RAISE NOTICE 'Constraint course_enrollments_term_id_fkey does not exist';
    END IF;
    
    -- Drop constraint from teacher_term_assignments if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teacher_term_assignments_term_id_fkey'
    ) THEN
        ALTER TABLE teacher_term_assignments DROP CONSTRAINT teacher_term_assignments_term_id_fkey;
        RAISE NOTICE 'Dropped constraint: teacher_term_assignments_term_id_fkey';
    ELSE
        RAISE NOTICE 'Constraint teacher_term_assignments_term_id_fkey does not exist';
    END IF;
END $$;

-- 2. Drop the term_id column from course_enrollments table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'term_id'
    ) THEN
        ALTER TABLE course_enrollments DROP COLUMN term_id;
        RAISE NOTICE 'Dropped column: term_id from course_enrollments';
    ELSE
        RAISE NOTICE 'Column term_id does not exist in course_enrollments';
    END IF;
END $$;

-- 3. Drop the teacher_term_assignments table completely if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_term_assignments') THEN
        DROP TABLE teacher_term_assignments CASCADE;
        RAISE NOTICE 'Dropped table: teacher_term_assignments';
    ELSE
        RAISE NOTICE 'Table teacher_term_assignments does not exist';
    END IF;
END $$;

-- 4. Drop the course_terms table completely if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_terms') THEN
        DROP TABLE course_terms CASCADE;
        RAISE NOTICE 'Dropped table: course_terms';
    ELSE
        RAISE NOTICE 'Table course_terms does not exist';
    END IF;
END $$;

-- 5. Drop related indexes if they exist
DROP INDEX IF EXISTS idx_course_enrollments_term_id;
DROP INDEX IF EXISTS idx_course_terms_course_id;

-- 6. Drop related triggers if they exist
-- Note: Triggers are automatically dropped when tables are dropped with CASCADE

-- 7. Clean up any remaining references in other tables
-- (This will be handled by the CASCADE operations above)

-- 8. Verify cleanup
DO $$
BEGIN
    -- Check if tables still exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_terms') THEN
        RAISE NOTICE 'WARNING: course_terms table still exists';
    ELSE
        RAISE NOTICE 'SUCCESS: course_terms table removed';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'teacher_term_assignments') THEN
        RAISE NOTICE 'WARNING: teacher_term_assignments table still exists';
    ELSE
        RAISE NOTICE 'SUCCESS: teacher_term_assignments table removed';
    END IF;
    
    -- Check if term_id column still exists in course_enrollments
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'term_id'
    ) THEN
        RAISE NOTICE 'WARNING: term_id column still exists in course_enrollments';
    ELSE
        RAISE NOTICE 'SUCCESS: term_id column removed from course_enrollments';
    END IF;
END $$;

-- 9. Final verification query
SELECT 
    'Tables' as object_type,
    table_name as object_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_name IN ('course_terms', 'teacher_term_assignments')
UNION ALL
SELECT 
    'Columns' as object_type,
    table_name || '.' || column_name as object_name,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' AND column_name = 'term_id';

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
