-- Add metadata field to exercises table for exercise-specific configuration
-- This allows storing exercise-specific metadata in JSON format

ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better performance when querying metadata
CREATE INDEX IF NOT EXISTS idx_exercises_metadata 
ON public.exercises USING GIN (metadata);

-- Add comment to document the metadata field usage
COMMENT ON COLUMN public.exercises.metadata IS 'JSON field for storing exercise-specific metadata like attachments and other configuration';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully added metadata field to exercises table';
END $$; 