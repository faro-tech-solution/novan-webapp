-- Exercise Q&A System Triggers
-- =============================
-- This file contains all triggers for the Q&A system

-- ========================================
-- TRIGGER 1: Auto-update vote_count
-- ========================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_qa_vote_count ON exercise_qa_vote;

-- Create trigger to automatically update vote_count when votes change
CREATE TRIGGER trigger_update_qa_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON exercise_qa_vote
  FOR EACH ROW
  EXECUTE FUNCTION update_qa_vote_count();

-- Add comment
COMMENT ON TRIGGER trigger_update_qa_vote_count ON exercise_qa_vote IS 
'Automatically updates vote_count in exercise_qa table when votes are added, changed, or removed';

-- ========================================
-- TRIGGER 2: Auto-update updated_at timestamp
-- ========================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_updated_at_qa ON exercise_qa;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER set_updated_at_qa
  BEFORE UPDATE ON exercise_qa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TRIGGER set_updated_at_qa ON exercise_qa IS 
'Automatically updates updated_at timestamp when Q&A post is modified';

-- ========================================
-- TRIGGER 3: Notify instructor of new question
-- ========================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_trainer_new_question ON exercise_qa;

-- Create trigger to send notification when new question is posted
CREATE TRIGGER trigger_notify_trainer_new_question
  AFTER INSERT ON exercise_qa
  FOR EACH ROW
  EXECUTE FUNCTION notify_trainer_new_question();

-- Add comment
COMMENT ON TRIGGER trigger_notify_trainer_new_question ON exercise_qa IS 
'Sends notification to course instructor when a new question is posted';

-- ========================================
-- TRIGGER 4: Notify parent author of reply
-- ========================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_answer_to_question ON exercise_qa;

-- Create trigger to send notification when someone replies
CREATE TRIGGER trigger_notify_answer_to_question
  AFTER INSERT ON exercise_qa
  FOR EACH ROW
  EXECUTE FUNCTION notify_answer_to_question();

-- Add comment
COMMENT ON TRIGGER trigger_notify_answer_to_question ON exercise_qa IS 
'Sends notification to parent post author when someone replies to their question/answer';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- List all triggers for Q&A tables
SELECT 
  'Exercise Q&A Triggers:' as trigger_info,
  tgname as trigger_name,
  proname as function_name,
  tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('exercise_qa', 'exercise_qa_vote')
  AND tgname LIKE '%qa%'
ORDER BY c.relname, tgname;

-- ========================================
-- LOG COMPLETION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Exercise Q&A triggers created successfully:';
    RAISE NOTICE '- trigger_update_qa_vote_count: Updates vote counts on exercise_qa_vote changes';
    RAISE NOTICE '- set_updated_at_qa: Updates timestamps on exercise_qa modifications';
    RAISE NOTICE '- trigger_notify_trainer_new_question: Sends notifications for new questions';
    RAISE NOTICE '- trigger_notify_answer_to_question: Sends notifications for new replies';
    RAISE NOTICE 'All Q&A triggers are now active!';
END $$;

