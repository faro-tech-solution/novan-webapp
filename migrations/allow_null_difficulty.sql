-- Migration: Allow null difficulty and convert to English values
-- This migration allows the difficulty field to be nullable and converts Persian values to English

-- First, drop the existing check constraint that restricts difficulty values
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_difficulty_check;

-- Update the difficulty column to allow NULL values
ALTER TABLE exercises ALTER COLUMN difficulty DROP NOT NULL;

-- Convert existing Persian difficulty values to English equivalents
UPDATE exercises 
SET difficulty = CASE 
    WHEN difficulty = 'آسان' THEN 'easy'
    WHEN difficulty = 'متوسط' THEN 'medium'
    WHEN difficulty = 'سخت' THEN 'hard'
    ELSE difficulty  -- Keep any existing English values or unknown values
END
WHERE difficulty IS NOT NULL;

-- Add a new check constraint that allows English values and NULL
ALTER TABLE exercises ADD CONSTRAINT exercises_difficulty_check 
    CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard'));

-- Add a comment to document this change
COMMENT ON COLUMN exercises.difficulty IS 'Exercise difficulty level (easy/medium/hard) - can be null if not specified';
