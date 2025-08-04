-- Add iframe_html column to exercises table
-- This migration adds support for storing full HTML code for iframe exercises

DO $$
BEGIN
    -- Add iframe_html column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'iframe_html'
    ) THEN
        ALTER TABLE exercises 
        ADD COLUMN iframe_html TEXT;
        
        RAISE NOTICE 'Successfully added iframe_html column to exercises table';
    ELSE
        RAISE NOTICE 'iframe_html column already exists in exercises table';
    END IF;
END $$; 