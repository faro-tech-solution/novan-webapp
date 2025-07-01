-- Create accounting table
CREATE TABLE accounting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Amount in Rials (positive for payments, negative for purchases)
    description TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_accounting_user_id ON accounting(user_id);
CREATE INDEX idx_accounting_course_id ON accounting(course_id);
CREATE INDEX idx_accounting_transaction_date ON accounting(transaction_date);

-- Add RLS policies
ALTER TABLE accounting ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all records
CREATE POLICY "Admins can view all accounting records"
    ON accounting FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to insert records
CREATE POLICY "Admins can insert accounting records"
    ON accounting FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update records
CREATE POLICY "Admins can update accounting records"
    ON accounting FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) FROM accounting WHERE accounting.user_id = $1),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle course purchase
CREATE OR REPLACE FUNCTION handle_course_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert negative amount for course purchase
    INSERT INTO accounting (
        user_id,
        course_id,
        amount,
        description,
        payment_status
    ) VALUES (
        NEW.student_id,
        NEW.course_id,
        -NEW.price,
        'خرید دوره',
        'completed'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for course purchase
CREATE TRIGGER on_course_purchase
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION handle_course_purchase(); 