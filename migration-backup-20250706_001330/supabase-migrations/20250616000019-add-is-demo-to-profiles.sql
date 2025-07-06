-- Add is_demo field to profiles table
ALTER TABLE profiles ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
-- Optionally, add a comment for clarity
COMMENT ON COLUMN profiles.is_demo IS 'Marks user as demo/test account'; 