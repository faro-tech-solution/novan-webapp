-- Migration: Fix Course Enrollment Accounting Integration
-- Date: 2025-07-02
-- Description: This migration drops the handle_course_enrollment_payment trigger and function
-- as we'll handle course enrollment accounting in the application code instead.
-- This allows us to use the manually entered price (قیمت دوره) directly as the negative amount
-- in accounting records, rather than always using the course's fixed price.
-- Note: This migration assumes the 'accounting' and 'course_enrollments' tables already exist.

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;

-- Drop the existing function
DROP FUNCTION IF EXISTS handle_course_enrollment_payment();

-- Create a function to calculate student balance
CREATE OR REPLACE FUNCTION calculate_student_balance(p_user_id UUID) 
RETURNS NUMERIC AS $$ 
DECLARE 
  balance NUMERIC;

BEGIN
SELECT
  COALESCE(SUM(amount), 0) INTO balance
FROM
  accounting
WHERE
  user_id = p_user_id;

RETURN balance;

END;
$$ LANGUAGE plpgsql;