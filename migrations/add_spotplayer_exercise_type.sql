-- Add 'spotplayer' to exercise_type check constraint
-- ================================================

-- Drop the existing constraint
ALTER TABLE public.exercises 
DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;

-- Add the new constraint that includes 'spotplayer'
ALTER TABLE public.exercises 
ADD CONSTRAINT exercises_exercise_type_check 
CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'spotplayer'));

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully added spotplayer to exercise_type check constraint';
END $$; 