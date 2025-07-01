-- Add payment_type column to accounting table
ALTER TABLE accounting
ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'buy_course' 
CHECK (payment_type IN ('buy_course', 'discount', 'pay_money', 'refund'));

-- Update the handle_course_enrollment_payment function to include payment_type
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
            transaction_date,
            payment_type
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            -course_price, -- Negative amount for payment
            'پرداخت شهریه دوره',
            'completed',
            NEW.enrolled_at,
            'buy_course'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 