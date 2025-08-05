-- Migration to fix the exercise_submissions_latest_answer_check constraint issue
-- This migration addresses the constraint violation error

-- Option 1: Drop the problematic constraint if it exists
DO $$
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exercise_submissions_latest_answer_check'
        AND table_name = 'exercise_submissions'
    ) THEN
        ALTER TABLE exercise_submissions DROP CONSTRAINT exercise_submissions_latest_answer_check;
        RAISE NOTICE 'Dropped constraint exercise_submissions_latest_answer_check';
    ELSE
        RAISE NOTICE 'Constraint exercise_submissions_latest_answer_check does not exist';
    END IF;
END $$;

-- Option 2: Make the latest_answer field nullable if it's currently NOT NULL
DO $$
BEGIN
    -- Check if latest_answer is NOT NULL and make it nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercise_submissions' 
        AND column_name = 'latest_answer' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE exercise_submissions ALTER COLUMN latest_answer DROP NOT NULL;
        RAISE NOTICE 'Made latest_answer field nullable';
    ELSE
        RAISE NOTICE 'latest_answer field is already nullable or does not exist';
    END IF;
END $$;

-- Option 3: Add a default value for latest_answer if it doesn't have one
DO $$
BEGIN
    -- Check if latest_answer has a default value
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercise_submissions' 
        AND column_name = 'latest_answer' 
        AND column_default IS NOT NULL
    ) THEN
        ALTER TABLE exercise_submissions ALTER COLUMN latest_answer SET DEFAULT '';
        RAISE NOTICE 'Added default empty string for latest_answer field';
    ELSE
        RAISE NOTICE 'latest_answer field already has a default value';
    END IF;
END $$;

-- Option 4: Update existing records that might have NULL latest_answer
UPDATE exercise_submissions 
SET latest_answer = COALESCE(solution, '') 
WHERE latest_answer IS NULL;

-- Add a comment to document this fix
COMMENT ON COLUMN exercise_submissions.latest_answer IS 'Latest answer for the exercise submission. Should match solution field.'; 