-- Notification System Triggers
-- ============================

-- Trigger to create notification when exercise feedback is updated
DROP TRIGGER IF EXISTS on_feedback_updated ON exercise_submissions;
DROP TRIGGER IF EXISTS trigger_feedback_notification ON exercise_submissions;
CREATE TRIGGER trigger_feedback_notification
  AFTER UPDATE ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_notification();

-- Trigger to create notification when award is achieved
DROP TRIGGER IF EXISTS on_award_achieved ON student_awards;
DROP TRIGGER IF EXISTS trigger_award_notification ON student_awards;
CREATE TRIGGER trigger_award_notification
  AFTER INSERT ON student_awards
  FOR EACH ROW
  EXECUTE FUNCTION create_award_notification(); 