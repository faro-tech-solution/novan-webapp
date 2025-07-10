-- Remove instructor_name, add slug and thumbnail to courses table
ALTER TABLE courses
  DROP COLUMN IF EXISTS instructor_name,
  ADD COLUMN slug TEXT NOT NULL UNIQUE,
  ADD COLUMN thumbnail TEXT; 