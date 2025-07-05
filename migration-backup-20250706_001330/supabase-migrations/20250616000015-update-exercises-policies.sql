-- Drop existing policies
DROP POLICY IF EXISTS "Users can view exercises based on role" ON public.exercises;
DROP POLICY IF EXISTS "Trainers and admins can create exercises" ON public.exercises;
DROP POLICY IF EXISTS "Trainers and admins can update exercises" ON public.exercises;
DROP POLICY IF EXISTS "Trainers and admins can delete exercises" ON public.exercises;

-- Create new policies for exercises table

-- Allow admins to do everything
CREATE POLICY "Admins can do everything with exercises"
  ON public.exercises
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow trainers to view all exercises
CREATE POLICY "Trainers can view all exercises"
  ON public.exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'trainer'
    )
  );

-- Allow trainers to create exercises
CREATE POLICY "Trainers can create exercises"
  ON public.exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'trainer'
    )
  );

-- Allow trainers to update exercises
CREATE POLICY "Trainers can update exercises"
  ON public.exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'trainer'
    )
  );

-- Allow trainers to delete exercises
CREATE POLICY "Trainers can delete exercises"
  ON public.exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'trainer'
    )
  );

-- Allow trainees to view active exercises
CREATE POLICY "Trainees can view active exercises"
  ON public.exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'trainee'
    )
  ); 