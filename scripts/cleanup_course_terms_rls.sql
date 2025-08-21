-- =====================================================
-- COURSE TERMS RLS POLICIES CLEANUP SCRIPT
-- This script removes all RLS policies related to course terms
-- =====================================================

-- 1. Drop RLS policies for course_terms table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_terms') THEN
        DROP POLICY IF EXISTS "Users can view course terms" ON course_terms;
        DROP POLICY IF EXISTS "Instructors can manage course terms" ON course_terms;
        DROP POLICY IF EXISTS "Instructors can manage terms for their courses" ON course_terms;
        DROP POLICY IF EXISTS "Admins can manage all course terms" ON course_terms;
        DROP POLICY IF EXISTS "Trainers can view assigned course terms" ON course_terms;
        DROP POLICY IF EXISTS "Trainers can update assigned course terms" ON course_terms;
        DROP POLICY IF EXISTS "Course creators can manage course terms" ON course_terms;
        RAISE NOTICE 'Dropped RLS policies for course_terms table';
    ELSE
        RAISE NOTICE 'course_terms table does not exist, skipping RLS policy cleanup';
    END IF;
END $$;

-- 2. Drop RLS policies for teacher_term_assignments table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_term_assignments') THEN
        DROP POLICY IF EXISTS "Teachers can view their own term assignments" ON teacher_term_assignments;
        RAISE NOTICE 'Dropped RLS policies for teacher_term_assignments table';
    ELSE
        RAISE NOTICE 'teacher_term_assignments table does not exist, skipping RLS policy cleanup';
    END IF;
END $$;

-- 3. Disable RLS on course_terms table (if it still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_terms') THEN
        ALTER TABLE course_terms DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on course_terms table';
    ELSE
        RAISE NOTICE 'course_terms table does not exist, skipping RLS disable';
    END IF;
END $$;

-- 4. Disable RLS on teacher_term_assignments table (if it still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_term_assignments') THEN
        ALTER TABLE teacher_term_assignments DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on teacher_term_assignments table';
    ELSE
        RAISE NOTICE 'teacher_term_assignments table does not exist, skipping RLS disable';
    END IF;
END $$;

-- 5. Clean up any remaining RLS policy references
-- This will be handled when the tables are dropped

-- =====================================================
-- RLS CLEANUP COMPLETE
-- =====================================================
