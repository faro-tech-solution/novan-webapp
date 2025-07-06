-- Consolidated Course and Accounting System Migration
-- This migration consolidates all course enrollment and accounting changes

-- Add course pricing
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Create payment type and status enums
DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'cash', 'free');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update course_enrollments table
DROP TABLE IF EXISTS course_enrollments CASCADE;
CREATE TABLE course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    payment_status payment_status DEFAULT 'pending',
    payment_type payment_type DEFAULT 'free',
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);

-- Enable RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = student_id);

-- Create accounting table
DROP TABLE IF EXISTS accounting CASCADE;
CREATE TABLE accounting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
    payment_method payment_type,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for accounting
ALTER TABLE accounting ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounting
CREATE POLICY "Users can view their own accounting records" ON accounting
    FOR SELECT USING (auth.uid() = user_id);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER set_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_accounting_updated_at
    BEFORE UPDATE ON accounting
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create course enrollment accounting trigger
CREATE OR REPLACE FUNCTION public.handle_course_enrollment_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create accounting record if payment status is completed
    IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
        INSERT INTO accounting (
            user_id,
            course_id,
            enrollment_id,
            amount,
            transaction_type,
            payment_method,
            payment_status,
            description
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            NEW.id,
            NEW.amount_paid,
            'payment',
            NEW.payment_type,
            NEW.payment_status,
            'Course enrollment payment'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER course_enrollment_payment_trigger
    AFTER INSERT OR UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_course_enrollment_payment();
