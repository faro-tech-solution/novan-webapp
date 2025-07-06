-- Update course_enrollments table to use first_name and last_name
ALTER TABLE course_enrollments
  DROP COLUMN student_name,
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT;

-- Update the handle_new_enrollment function
CREATE OR REPLACE FUNCTION handle_new_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Get student details from profiles
  SELECT first_name, last_name, email
  INTO NEW.first_name, NEW.last_name, NEW.student_email
  FROM profiles
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger
DROP TRIGGER IF EXISTS set_enrollment_details ON course_enrollments;
CREATE TRIGGER set_enrollment_details
  BEFORE INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_enrollment(); 