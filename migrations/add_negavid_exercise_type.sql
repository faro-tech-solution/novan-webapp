-- Add 'negavid' to exercise_type check constraint
-- ===================================================

DO $$
BEGIN
    -- Drop the existing constraint
    ALTER TABLE exercises 
    DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
    
    -- Add the new constraint with negavid included
    ALTER TABLE exercises 
    ADD CONSTRAINT exercises_exercise_type_check
    CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe', 'arvan_video', 'negavid'));
    
    RAISE NOTICE 'Successfully added negavid to exercise_type check constraint';
END $$;
