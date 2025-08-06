-- Add 'iframe' to exercise_type check constraint
-- This migration adds support for iframe-based exercises

DO $$
BEGIN
    -- Drop the existing constraint
    ALTER TABLE exercises 
    DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
    
    -- Add the new constraint with iframe included
    ALTER TABLE exercises 
    ADD CONSTRAINT exercises_exercise_type_check
    CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe'));
    
    RAISE NOTICE 'Successfully added iframe to exercise_type check constraint';
END $$; 