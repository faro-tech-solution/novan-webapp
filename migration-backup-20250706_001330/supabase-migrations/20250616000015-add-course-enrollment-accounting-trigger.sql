-- Create function to handle course enrollment payment
CREATE OR REPLACE FUNCTION handle_course_enrollment_payment()
RETURNS TRIGGER AS $$
DECLARE
    course_price DECIMAL;
BEGIN
    -- Get the course price
    SELECT price INTO course_price
    FROM courses
    WHERE id = NEW.course_id;

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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for course enrollment payment
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;
CREATE TRIGGER on_course_enrollment_payment
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION handle_course_enrollment_payment(); 