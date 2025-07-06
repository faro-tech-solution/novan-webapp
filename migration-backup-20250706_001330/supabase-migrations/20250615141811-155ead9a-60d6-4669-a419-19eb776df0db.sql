
-- Create student_activity_logs table to track daily engagement
CREATE TABLE public.student_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'login', 'exercise_view', 'exercise_start', 'exercise_complete', 'page_visit', 'study_session'
  activity_data JSONB, -- Additional data like exercise_id, page_name, session_duration, etc.
  points_earned INTEGER DEFAULT 0, -- Points earned from this activity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT, -- To group related activities in a session
  duration_minutes INTEGER DEFAULT 0 -- Duration of the activity in minutes
);

-- Add Row Level Security
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for student_activity_logs
CREATE POLICY "Students can view their own activity logs" 
  ON public.student_activity_logs 
  FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own activity logs" 
  ON public.student_activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Create index for better performance on queries
CREATE INDEX idx_student_activity_logs_student_date 
  ON public.student_activity_logs(student_id, created_at);

CREATE INDEX idx_student_activity_logs_type 
  ON public.student_activity_logs(activity_type);

-- Create a function to log student activity
CREATE OR REPLACE FUNCTION public.log_student_activity(
  p_student_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT NULL,
  p_points_earned INTEGER DEFAULT 0,
  p_session_id TEXT DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.student_activity_logs (
    student_id,
    activity_type,
    activity_data,
    points_earned,
    session_id,
    duration_minutes
  ) VALUES (
    p_student_id,
    p_activity_type,
    p_activity_data,
    p_points_earned,
    p_session_id,
    p_duration_minutes
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;
