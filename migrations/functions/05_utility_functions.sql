-- Utility Functions
-- =================

-- Function to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp (alias for set_updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if student is enrolled in course
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_course(course_id uuid, student_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE course_id = $1 AND student_id = $2 AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log student activity
CREATE OR REPLACE FUNCTION public.log_student_activity(
  p_student_id UUID,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  -- This function would log student activity to a daily_activities table
  -- Implementation depends on your activity logging requirements
  -- For now, this is a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle exercise submission activity
CREATE OR REPLACE FUNCTION handle_exercise_submission_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log activity when exercise is submitted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_student_activity(
      NEW.student_id,
      'exercise_submission',
      'Submitted exercise: ' || (SELECT title FROM exercises WHERE id = NEW.exercise_id),
      jsonb_build_object(
        'exercise_id', NEW.exercise_id,
        'submission_id', NEW.id,
        'score', NEW.score
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 