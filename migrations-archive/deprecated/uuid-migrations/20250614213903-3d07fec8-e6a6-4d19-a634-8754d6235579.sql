
-- Create terms table
CREATE TABLE public.course_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  max_students INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.course_terms ENABLE ROW LEVEL SECURITY;

-- RLS policies for course terms
CREATE POLICY "Trainers can view terms for their courses" 
  ON public.course_terms 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_terms.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create terms for their courses" 
  ON public.course_terms 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_terms.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update terms for their courses" 
  ON public.course_terms 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_terms.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete terms for their courses" 
  ON public.course_terms 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_terms.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add term_id to course_enrollments table
ALTER TABLE public.course_enrollments ADD COLUMN term_id UUID REFERENCES public.course_terms(id) ON DELETE CASCADE;
