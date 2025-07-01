-- Drop the existing check constraint
ALTER TABLE accounting 
  DROP CONSTRAINT IF EXISTS accounting_payment_status_check;

-- Drop the default value
ALTER TABLE accounting 
  ALTER COLUMN payment_status DROP DEFAULT;

-- Drop the existing enum type
ALTER TABLE accounting 
  ALTER COLUMN payment_status TYPE text;

DROP TYPE IF EXISTS payment_status;

-- Create the updated enum type with the new value
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'waiting'
);

-- Update the column to use the new enum type
ALTER TABLE accounting 
  ALTER COLUMN payment_status TYPE payment_status 
  USING payment_status::payment_status;

-- Add back the default value
ALTER TABLE accounting 
  ALTER COLUMN payment_status SET DEFAULT 'completed'::payment_status;

-- Add back the check constraint
ALTER TABLE accounting
  ADD CONSTRAINT accounting_payment_status_check 
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'waiting')); 