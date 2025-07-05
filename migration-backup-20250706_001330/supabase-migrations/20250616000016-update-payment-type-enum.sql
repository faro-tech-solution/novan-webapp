-- Drop the existing check constraint
ALTER TABLE accounting 
  DROP CONSTRAINT IF EXISTS accounting_payment_type_check;

-- Drop the default value
ALTER TABLE accounting 
  ALTER COLUMN payment_type DROP DEFAULT;

-- Drop the existing enum type
ALTER TABLE accounting 
  ALTER COLUMN payment_type TYPE text;

DROP TYPE IF EXISTS payment_type;

-- Create the updated enum type with the new value
CREATE TYPE payment_type AS ENUM (
  'buy_course',
  'discount',
  'pay_money',
  'refund',
  'installment'
);

-- Update the column to use the new enum type
ALTER TABLE accounting 
  ALTER COLUMN payment_type TYPE payment_type 
  USING payment_type::payment_type;

-- Add back the default value
ALTER TABLE accounting 
  ALTER COLUMN payment_type SET DEFAULT 'pay_money'::payment_type;

-- Add back the check constraint
ALTER TABLE accounting
  ADD CONSTRAINT accounting_payment_type_check 
  CHECK (payment_type IN ('buy_course', 'discount', 'pay_money', 'refund', 'installment')); 