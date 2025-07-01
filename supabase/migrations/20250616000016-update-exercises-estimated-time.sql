-- Update estimated_time column to ensure it's properly handled
ALTER TABLE public.exercises
  ALTER COLUMN estimated_time SET DEFAULT '-',
  ALTER COLUMN estimated_time SET NOT NULL;

-- Update any existing NULL values
UPDATE public.exercises
SET estimated_time = '-'
WHERE estimated_time IS NULL; 