
-- Add open_date and close_date columns to exercises table to track when exercises are available
ALTER TABLE public.exercises 
ADD COLUMN open_date DATE,
ADD COLUMN close_date DATE;

-- Update existing exercises to have proper dates based on current logic
-- For existing exercises, set open_date to creation date and close_date to due_date
UPDATE public.exercises 
SET 
  open_date = created_at::date,
  close_date = due_date
WHERE open_date IS NULL OR close_date IS NULL;

-- Make the new columns NOT NULL after setting values
ALTER TABLE public.exercises 
ALTER COLUMN open_date SET NOT NULL,
ALTER COLUMN close_date SET NOT NULL;

-- Update the RLS policy for trainees to include date-based access
-- Drop existing policy and create new one
DROP POLICY IF EXISTS "Users can view exercises based on role" ON public.exercises;

CREATE POLICY "Users can view exercises based on role" 
  ON public.exercises 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        role IN ('trainer', 'admin') OR 
        (role = 'trainee' AND exercises.status = 'active' AND exercises.open_date <= CURRENT_DATE)
      )
    )
  );

-- Add index for better performance on date queries
CREATE INDEX idx_exercises_open_date ON public.exercises(open_date);
CREATE INDEX idx_exercises_close_date ON public.exercises(close_date);
