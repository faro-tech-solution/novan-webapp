-- Achievement System Triggers
-- ===========================

-- Trigger to check achievements after exercise submission
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;
DROP TRIGGER IF EXISTS trigger_check_achievements_after_submission ON exercise_submissions;
CREATE TRIGGER trigger_check_achievements_after_submission
  AFTER INSERT ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_achievements(); 