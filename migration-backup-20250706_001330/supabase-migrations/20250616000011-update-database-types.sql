-- Update the course_enrollments table type
DROP TYPE IF EXISTS course_enrollment CASCADE;

CREATE TYPE course_enrollment AS (
  id UUID,
  course_id UUID,
  student_id UUID,
  first_name TEXT,
  last_name TEXT,
  student_email TEXT,
  status TEXT,
  enrolled_at TIMESTAMPTZ,
  term_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

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