-- Activity Logging Triggers
-- =========================

-- Trigger to log exercise submission activity
DROP TRIGGER IF EXISTS trigger_exercise_submission_activity ON exercise_submissions;
CREATE TRIGGER trigger_exercise_submission_activity
  AFTER INSERT ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_exercise_submission_activity(); 