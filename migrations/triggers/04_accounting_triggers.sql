-- Accounting System Triggers
-- ==========================

-- Trigger to handle course purchase accounting
DROP TRIGGER IF EXISTS on_course_purchase ON course_enrollments;
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;
DROP TRIGGER IF EXISTS course_payment_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS handle_enrollment_payment ON course_enrollments;
DROP TRIGGER IF EXISTS process_course_payment ON course_enrollments;
DROP TRIGGER IF EXISTS course_enrollment_payment_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS trigger_course_purchase ON course_enrollments;
CREATE TRIGGER trigger_course_purchase
  AFTER INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION handle_course_purchase(); 