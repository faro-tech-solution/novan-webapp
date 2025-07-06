-- Accounting System Functions
-- ===========================

-- Function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) FROM accounting WHERE accounting.user_id = $1),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate student balance
CREATE OR REPLACE FUNCTION calculate_student_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_balance INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_balance
    FROM accounting
    WHERE user_id = p_user_id;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle course purchase
CREATE OR REPLACE FUNCTION handle_course_purchase()
RETURNS TRIGGER AS $$
DECLARE
    course_price INTEGER;
BEGIN
    -- Get the course price
    SELECT price INTO course_price
    FROM courses
    WHERE id = NEW.course_id;

    -- Only create accounting record if course has a price
    IF course_price > 0 THEN
        -- Insert negative amount for course purchase
        INSERT INTO accounting (
            user_id,
            course_id,
            amount,
            description,
            payment_status,
            payment_type
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            -course_price,
            'خرید دوره',
            'completed',
            'buy_course'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 