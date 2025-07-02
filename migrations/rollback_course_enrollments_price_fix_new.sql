-- Rollback for fix_course_enrollments_price.sql
-- Date: 2025-07-02
-- Description: This rollback restores the original handle_course_enrollment_payment function
-- Drop the trigger we created
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;

-- Drop our modified functions
DROP FUNCTION IF EXISTS handle_course_enrollment_payment();

DROP FUNCTION IF EXISTS calculate_student_balance(UUID);

-- Recreate the original function and trigger as they were before our changes
CREATE OR REPLACE FUNCTION handle_course_enrollment_payment()
RETURNS TRIGGER AS $$ 
DECLARE 
  course_price DECIMAL;

BEGIN -- Get the course price
SELECT
  price INTO course_price
FROM
  courses
WHERE
  id = NEW.course_id;

-- Only create accounting record if course has a price
IF course_price > 0 THEN -- Insert accounting record for the payment
INSERT INTO
  accounting (
    user_id,
    course_id,
    amount,
    description,
    payment_status,
    transaction_date,
    payment_type
  )
VALUES
  (
    NEW.student_id,
    NEW.course_id,
    - course_price,
    -- Negative amount for payment
    'پرداخت شهریه دوره',
    'completed',
    NEW.enrolled_at,
    'buy_course'
  );

END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the original trigger
CREATE TRIGGER on_course_enrollment_payment
AFTER
INSERT
  ON course_enrollments FOR EACH ROW EXECUTE FUNCTION handle_course_enrollment_payment();