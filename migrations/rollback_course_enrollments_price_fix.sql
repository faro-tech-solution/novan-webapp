-- Rollback for fix_course_enrollments_price.sql
-- Date: 2025-07-02
-- Description: This rollback removes the trigger and function added to handle course enrollment accounting
-- Drop the trigger
DROP TRIGGER IF EXISTS create_accounting_record_on_enrollment ON course_enrollments;

-- Drop the functions
DROP FUNCTION IF EXISTS create_course_enrollment_accounting_record();

DROP FUNCTION IF EXISTS calculate_student_balance(UUID);