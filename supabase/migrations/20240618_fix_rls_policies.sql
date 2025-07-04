-- Fix RLS policy for exercise submissions
-- Temporarily drop the existing policy and recreate with proper checks

DROP POLICY IF EXISTS "Students can create submissions" ON public.exercise_submissions;

-- Recreate the policy with better error handling
CREATE POLICY "Students can create submissions" 
  ON public.exercise_submissions 
  FOR INSERT 
  WITH CHECK (
    student_id = auth.uid() AND
    auth.uid() IS NOT NULL
  );

-- Update profiles table to include 'admin' role if not already present
DO $$
BEGIN
  -- Check if 'admin' is already in the role constraint
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%profiles_role_check%' 
    AND check_clause LIKE '%admin%'
  ) THEN
    -- Drop the old constraint and add a new one with admin
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role IN ('trainer', 'trainee', 'admin'));
  END IF;
END $$;
