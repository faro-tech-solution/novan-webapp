-- Add 'arvan_video' to exercise_type check constraint
-- ===================================================

DO $$
BEGIN
    -- Drop the existing constraint
    ALTER TABLE exercises 
    DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
    
    -- Add the new constraint with arvan_video included
    ALTER TABLE exercises 
    ADD CONSTRAINT exercises_exercise_type_check
    CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe', 'arvan_video'));
    
    RAISE NOTICE 'Successfully added arvan_video to exercise_type check constraint';
END $$;