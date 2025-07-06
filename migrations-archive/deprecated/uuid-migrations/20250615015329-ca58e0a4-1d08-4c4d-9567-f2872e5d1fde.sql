
-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;

-- Create a security definer function to check if a user is enrolled in a course
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_course(course_id uuid, student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments 
    WHERE course_enrollments.course_id = is_student_enrolled_in_course.course_id 
    AND course_enrollments.student_id = is_student_enrolled_in_course.student_id
  );
$$;

-- Create a new policy using the security definer function
CREATE POLICY "Students can view enrolled courses" 
  ON public.courses 
  FOR SELECT 
  USING (public.is_student_enrolled_in_course(id, auth.uid()));
