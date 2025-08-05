-- Remove days_to_* fields from exercises table
-- ===============================================
-- This migration removes the days_to_open, days_to_due, and days_to_close fields
-- from the exercises table as they are being replaced with direct date fields

-- Remove all date-related columns from exercises table
ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS days_to_open,
DROP COLUMN IF EXISTS days_to_due, 
DROP COLUMN IF EXISTS days_to_close,
DROP COLUMN IF EXISTS open_date,
DROP COLUMN IF EXISTS due_date,
DROP COLUMN IF EXISTS close_date;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully removed all date-related fields from exercises table';
    RAISE NOTICE 'Removed: days_to_open, days_to_due, days_to_close, open_date, due_date, close_date';
    RAISE NOTICE 'Exercises now have no date constraints - they are always available';
END $$;