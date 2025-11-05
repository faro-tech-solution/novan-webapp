-- Update RLS Policy for Exercises to Filter Disabled Exercises for Trainees
-- ======================================================================
-- This migration updates the "Users can view exercises" policy to exclude
-- disabled exercises for trainees, while admins and trainers continue to see all exercises

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;

-- Recreate the policy with disabled exercise filtering for trainees
CREATE POLICY "Users can view exercises" ON exercises
FOR SELECT USING (
  auth.role() = 'authenticated'
  AND (
    -- Admins and trainers can see all exercises (including disabled)
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'trainer')
    )
    OR
    -- Trainees can only see non-disabled exercises
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'trainer')
      )
      AND is_disabled = false
    )
  )
);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'RLS policy updated successfully: Trainees can now only view non-disabled exercises';
    RAISE NOTICE 'Admins and trainers continue to see all exercises through their own policies';
END $$;
