
-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('آسان', 'متوسط', 'سخت')),
  due_date DATE NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  estimated_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'draft')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise submissions table
CREATE TABLE public.exercise_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  solution TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id),
  UNIQUE(exercise_id, student_id)
);

-- Add RLS policies for exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Trainers and admins can view all exercises, trainees can view active exercises
CREATE POLICY "Users can view exercises based on role" 
  ON public.exercises 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role IN ('trainer', 'admin') OR (role = 'trainee' AND exercises.status = 'active'))
    )
  );

-- Only trainers and admins can create exercises
CREATE POLICY "Trainers and admins can create exercises" 
  ON public.exercises 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

-- Only trainers and admins can update exercises
CREATE POLICY "Trainers and admins can update exercises" 
  ON public.exercises 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

-- Only trainers and admins can delete exercises
CREATE POLICY "Trainers and admins can delete exercises" 
  ON public.exercises 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

-- Add RLS policies for exercise submissions
ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions, trainers and admins can view all
CREATE POLICY "Users can view submissions based on role" 
  ON public.exercise_submissions 
  FOR SELECT 
  USING (
    student_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

-- Students can create their own submissions
CREATE POLICY "Students can create submissions" 
  ON public.exercise_submissions 
  FOR INSERT 
  WITH CHECK (student_id = auth.uid());

-- Students can update their own submissions (before grading), trainers can update for grading
CREATE POLICY "Users can update submissions based on role" 
  ON public.exercise_submissions 
  FOR UPDATE 
  USING (
    (student_id = auth.uid() AND graded_at IS NULL) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_exercises_status ON public.exercises(status);
CREATE INDEX idx_exercises_course_name ON public.exercises(course_name);
CREATE INDEX idx_exercises_due_date ON public.exercises(due_date);
CREATE INDEX idx_exercise_submissions_exercise_id ON public.exercise_submissions(exercise_id);
CREATE INDEX idx_exercise_submissions_student_id ON public.exercise_submissions(student_id);
