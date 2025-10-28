-- Remove 'spotplayer' from exercise_type check constraint
-- This migration removes the spotplayer exercise type from the database

BEGIN;

-- Drop the existing constraint
ALTER TABLE public.exercises 
DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;

-- Add the new constraint without 'spotplayer'
ALTER TABLE public.exercises 
ADD CONSTRAINT exercises_exercise_type_check 
CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe'));

-- Update any existing spotplayer exercises to 'simple' type
UPDATE public.exercises 
SET exercise_type = 'simple' 
WHERE exercise_type = 'spotplayer';

-- Remove spotplayer metadata from exercises
UPDATE public.exercises 
SET metadata = metadata - 'spotplayer_course_id' - 'spotplayer_item_id'
WHERE metadata ? 'spotplayer_course_id' OR metadata ? 'spotplayer_item_id';

COMMIT;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully removed spotplayer from exercise_type check constraint';
    RAISE NOTICE 'Updated existing spotplayer exercises to simple type';
    RAISE NOTICE 'Cleaned up spotplayer metadata from exercises table';
END $$; 