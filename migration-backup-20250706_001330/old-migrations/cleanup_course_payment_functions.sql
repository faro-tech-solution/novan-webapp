-- Migration: Cleanup Course Payment Functions
-- Date: 2025-07-02
-- Description: This migration cleans up redundant course payment functions
-- and ensures only the correct handle_course_enrollment_payment function is used.
-- First, identify and drop any duplicate or unused triggers related to course payments
DROP TRIGGER IF EXISTS on_course_purchase ON course_enrollments;

DROP TRIGGER IF EXISTS course_payment_trigger ON course_enrollments;

DROP TRIGGER IF EXISTS handle_enrollment_payment ON course_enrollments;

DROP TRIGGER IF EXISTS process_course_payment ON course_enrollments;

-- Drop any redundant functions (but not our main handle_course_enrollment_payment)
DROP FUNCTION IF EXISTS handle_course_purchase();

DROP FUNCTION IF EXISTS process_course_payment();

DROP FUNCTION IF EXISTS handle_enrollment_payment();

-- Ensure our handle_course_enrollment_payment function is the only one
-- that handles course payments when students enroll
-- Note: We don't need to recreate it here as it's already properly set up
-- in the fix_course_enrollments_price.sql migration
-- Verification query to check the triggers on course_enrollments table
-- Uncomment this to use it in psql:
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'course_enrollments'::regclass::oid;
-- Verification query to check functions related to course payments
-- Uncomment this to use it in psql:
-- SELECT proname FROM pg_proc WHERE proname LIKE '%course%' OR proname LIKE '%payment%';