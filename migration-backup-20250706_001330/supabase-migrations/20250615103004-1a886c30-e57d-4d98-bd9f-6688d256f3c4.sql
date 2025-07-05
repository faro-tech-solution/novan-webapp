
-- Add new columns for relative days
ALTER TABLE public.exercises 
ADD COLUMN days_to_open INTEGER,
ADD COLUMN days_to_close INTEGER;

-- Update existing exercises to convert dates to relative days
-- For existing exercises, calculate days relative to created_at
UPDATE public.exercises 
SET 
  days_to_open = (open_date - created_at::date),
  days_to_close = (close_date - created_at::date)
WHERE days_to_open IS NULL OR days_to_close IS NULL;

-- Make the new columns NOT NULL after setting values
ALTER TABLE public.exercises 
ALTER COLUMN days_to_open SET NOT NULL,
ALTER COLUMN days_to_close SET NOT NULL;

-- Drop the old date columns
ALTER TABLE public.exercises 
DROP COLUMN open_date,
DROP COLUMN close_date;

-- Update due_date to also be relative days
ALTER TABLE public.exercises 
ADD COLUMN days_to_due INTEGER;

-- Convert due_date to relative days
UPDATE public.exercises 
SET days_to_due = (due_date - created_at::date)
WHERE days_to_due IS NULL;

-- Make days_to_due NOT NULL and drop due_date
ALTER TABLE public.exercises 
ALTER COLUMN days_to_due SET NOT NULL;

ALTER TABLE public.exercises 
DROP COLUMN due_date;
