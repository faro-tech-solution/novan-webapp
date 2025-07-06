
-- Add RLS policy for students to view courses they are enrolled in
CREATE POLICY "Students can view enrolled courses" 
  ON public.courses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.course_id = courses.id 
      AND course_enrollments.student_id = auth.uid()
    )
  );
