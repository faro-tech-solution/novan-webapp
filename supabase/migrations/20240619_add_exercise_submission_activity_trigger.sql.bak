-- Create a function to handle exercise submission activity logging
CREATE OR REPLACE FUNCTION public.handle_exercise_submission_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert activity log entry for the submission
  INSERT INTO public.student_activity_logs (
    student_id,
    activity_type,
    activity_data,
    points_earned,
    created_at
  ) VALUES (
    NEW.student_id,
    'exercise_complete',
    jsonb_build_object(
      'exercise_id', NEW.exercise_id,
      'submitted_at', NEW.submitted_at
    ),
    5,
    NEW.submitted_at
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically log activity after exercise submission
DROP TRIGGER IF EXISTS after_exercise_submission_activity ON public.exercise_submissions;
CREATE TRIGGER after_exercise_submission_activity
  AFTER INSERT ON public.exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_exercise_submission_activity(); 