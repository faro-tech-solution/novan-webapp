-- Drop existing triggers
DROP TRIGGER IF EXISTS on_course_purchase ON course_enrollments;
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_course_purchase();
DROP FUNCTION IF EXISTS handle_course_enrollment_payment();

-- Create new function to handle course enrollment payment
CREATE OR REPLACE FUNCTION handle_course_enrollment_payment()
RETURNS TRIGGER AS $$
DECLARE
    course_price DECIMAL;
BEGIN
    -- Get the course price
    SELECT price INTO course_price
    FROM courses
    WHERE id = NEW.course_id;

    -- Only create accounting record if course has a price
    IF course_price > 0 THEN
        -- Insert accounting record for the payment
        INSERT INTO accounting (
            user_id,
            course_id,
            amount,
            description,
            payment_status,
            transaction_date
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            -course_price, -- Negative amount for payment
            'ثبت نام در دوره',
            'completed',
            NEW.enrolled_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_course_enrollment_payment
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION handle_course_enrollment_payment(); 