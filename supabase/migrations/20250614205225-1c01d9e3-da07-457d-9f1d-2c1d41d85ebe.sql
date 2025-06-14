
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users NOT NULL,
  instructor_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed', 'inactive')),
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  UNIQUE(course_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for courses
CREATE POLICY "Trainers can view their own courses" 
  ON public.courses 
  FOR SELECT 
  USING (auth.uid() = instructor_id);

CREATE POLICY "Trainers can create courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Trainers can update their own courses" 
  ON public.courses 
  FOR UPDATE 
  USING (auth.uid() = instructor_id);

CREATE POLICY "Trainers can delete their own courses" 
  ON public.courses 
  FOR DELETE 
  USING (auth.uid() = instructor_id);

-- RLS policies for course enrollments
CREATE POLICY "Trainers can view enrollments for their courses" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_enrollments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage enrollments for their courses" 
  ON public.course_enrollments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_enrollments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own enrollments" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (auth.uid() = student_id);
