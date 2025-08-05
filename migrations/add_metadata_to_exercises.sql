-- Add metadata field to exercises table for SpotPlayer configuration
-- This allows storing spotplayer_course_id and spotplayer_item_id in JSON format

ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better performance when querying metadata
CREATE INDEX IF NOT EXISTS idx_exercises_metadata 
ON public.exercises USING GIN (metadata);

-- Add comment to document the metadata field usage
COMMENT ON COLUMN public.exercises.metadata IS 'JSON field for storing exercise-specific metadata like SpotPlayer configuration (spotplayer_course_id, spotplayer_item_id)';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully added metadata field to exercises table';
END $$; 