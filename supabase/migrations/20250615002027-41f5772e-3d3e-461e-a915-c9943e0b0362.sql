
-- Create table to store teacher-course assignments
CREATE TABLE public.teacher_course_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  UNIQUE(teacher_id, course_id)
);

-- Create table to store teacher-term assignments
CREATE TABLE public.teacher_term_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.course_terms(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  UNIQUE(teacher_id, term_id)
);

-- Enable RLS on both tables
ALTER TABLE public.teacher_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_term_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_course_assignments
CREATE POLICY "Admins can manage all teacher course assignments" 
  ON public.teacher_course_assignments 
  FOR ALL
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Teachers can view their own course assignments" 
  ON public.teacher_course_assignments 
  FOR SELECT 
  USING (auth.uid() = teacher_id);

-- RLS policies for teacher_term_assignments
CREATE POLICY "Admins can manage all teacher term assignments" 
  ON public.teacher_term_assignments 
  FOR ALL
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Teachers can view their own term assignments" 
  ON public.teacher_term_assignments 
  FOR SELECT 
  USING (auth.uid() = teacher_id);

-- Update existing policies to respect teacher assignments
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Trainers can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Trainers can view course enrollments for their courses" ON public.course_enrollments;
DROP POLICY IF EXISTS "Trainers can view course terms for their courses" ON public.course_terms;

-- Create new policies that respect assignments
CREATE POLICY "Teachers can view assigned courses" 
  ON public.courses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_course_assignments 
      WHERE teacher_id = auth.uid() AND course_id = courses.id
    )
  );

CREATE POLICY "Teachers can view enrollments for assigned courses" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_course_assignments 
      WHERE teacher_id = auth.uid() AND course_id = course_enrollments.course_id
    )
  );

CREATE POLICY "Teachers can view terms for assigned courses" 
  ON public.course_terms 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_course_assignments tca
      WHERE tca.teacher_id = auth.uid() AND tca.course_id = course_terms.course_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.teacher_term_assignments 
      WHERE teacher_id = auth.uid() AND term_id = course_terms.id
    )
  );
