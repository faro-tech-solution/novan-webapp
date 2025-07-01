-- Update course_enrollments table to use first_name and last_name
ALTER TABLE course_enrollments
  DROP COLUMN student_name,
  ADD COLUMN first_name TEXT NOT NULL DEFAULT 'نام',
  ADD COLUMN last_name TEXT NOT NULL DEFAULT 'نامشخص';

-- Update the handle_new_enrollment function
CREATE OR REPLACE FUNCTION handle_new_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Get student's name from profiles
  SELECT first_name, last_name INTO NEW.first_name, NEW.last_name
  FROM profiles
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 