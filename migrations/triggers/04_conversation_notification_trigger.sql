-- Conversation Notification Trigger
-- ===================================
-- This trigger creates notifications when trainer/admin responds to exercise submissions via conversation

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_conversation_notification ON exercise_submissions_conversation;

-- Create trigger for conversation notifications
CREATE TRIGGER trigger_conversation_notification
  AFTER INSERT ON exercise_submissions_conversation
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_notification();

-- Comment on trigger
COMMENT ON TRIGGER trigger_conversation_notification ON exercise_submissions_conversation IS 
'Trigger to create notifications when trainer/admin responds to exercise submissions';

