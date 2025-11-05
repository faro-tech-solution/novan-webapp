-- Add is_exercise and transcription fields to exercises table
-- is_exercise: boolean field to distinguish between exercises (true) and courses (false)
-- transcription: text field to store video transcription

ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS is_exercise BOOLEAN DEFAULT FALSE;

ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS transcription TEXT;

-- Add comment to document the fields
COMMENT ON COLUMN public.exercises.is_exercise IS 'Boolean field: true if this is an exercise, false if it is a course';
COMMENT ON COLUMN public.exercises.transcription IS 'Text field to store video transcription';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully added is_exercise and transcription fields to exercises table';
END $$;

