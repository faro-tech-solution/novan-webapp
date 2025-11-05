-- Add title column to exercise_notes table
-- This migration adds a required title field to notes for better organization

ALTER TABLE exercise_notes 
ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note';

-- Update existing notes to have meaningful titles
UPDATE exercise_notes 
SET title = CASE 
  WHEN LENGTH(content) > 50 THEN LEFT(content, 50) || '...'
  ELSE content
END
WHERE title = 'Untitled Note';

-- Add a comment to document the column
COMMENT ON COLUMN exercise_notes.title IS 'Title of the note - required field for better organization';