-- Create the set_updated_at() function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the accounting table
DROP TRIGGER IF EXISTS set_accounting_updated_at ON accounting;
CREATE TRIGGER set_accounting_updated_at
    BEFORE UPDATE ON accounting
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add the trigger to the course_enrollments table
DROP TRIGGER IF EXISTS set_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER set_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at(); 