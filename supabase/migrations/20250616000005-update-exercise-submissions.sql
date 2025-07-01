-- Update exercise_submissions table to use first_name and last_name
ALTER TABLE exercise_submissions
  DROP COLUMN student_name,
  ADD COLUMN first_name TEXT NOT NULL DEFAULT 'نام',
  ADD COLUMN last_name TEXT NOT NULL DEFAULT 'نامشخص';

-- Update the handle_new_submission function
CREATE OR REPLACE FUNCTION handle_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Get student's name from profiles
  SELECT first_name, last_name INTO NEW.first_name, NEW.last_name
  FROM profiles
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 