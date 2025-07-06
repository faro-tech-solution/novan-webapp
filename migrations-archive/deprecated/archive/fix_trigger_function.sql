-- Fix the trigger check function to avoid ambiguous column references

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;

-- Now we can safely drop and recreate the trigger function
DROP FUNCTION IF EXISTS public.trigger_check_achievements();

CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Explicitly use the student_id from NEW record
  PERFORM public.check_and_award_achievements(NEW.student_id);
  RETURN NEW;
END;
$$;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;

CREATE TRIGGER after_exercise_submission
  AFTER INSERT OR UPDATE ON public.exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_achievements();

-- Comment explaining the migration
COMMENT ON FUNCTION public.trigger_check_achievements() IS 'Fixed trigger function for achievement checks to avoid ambiguous column references';
