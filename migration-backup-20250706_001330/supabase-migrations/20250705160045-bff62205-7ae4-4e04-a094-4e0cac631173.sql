-- Fix permission issue for trainers accessing student profiles
-- This adds a new policy allowing trainers to view all profiles

-- Check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "Trainers can view all profiles" ON public.profiles;

-- Create a security definer function to check if a user is a trainer or admin
-- Using a security definer function prevents the recursion issue
CREATE OR REPLACE FUNCTION is_trainer_or_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Directly query the role without using the policy
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role IN ('trainer', 'admin');
END;
$$ LANGUAGE plpgsql;

-- Create the new policy that allows trainers and admins to view all profiles
CREATE POLICY "Trainers can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_trainer_or_admin());

-- Note: Keep the existing policy "Users can view their own profile" as well
-- so that trainees can still view their own profiles
