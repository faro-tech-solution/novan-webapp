-- Migration: Fix moderate_question function ambiguous column reference
-- Date: 2025-01-27
-- Description: Fixes the ambiguous column reference error in the moderate_question function

BEGIN;

-- Drop the existing function
DROP FUNCTION IF EXISTS moderate_question(UUID, TEXT, TEXT);

-- Recreate the function with proper column references
CREATE OR REPLACE FUNCTION moderate_question(
  question_id UUID,
  action TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = current_user_id
    AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can moderate questions';
  END IF;
  
  -- Perform moderation action
  CASE action
    WHEN 'approve' THEN
      UPDATE public.exercise_questions 
      SET 
        moderation_status = 'approved',
        admin_notes = moderate_question.admin_notes,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'reject' THEN
      UPDATE public.exercise_questions 
      SET 
        moderation_status = 'rejected',
        admin_notes = moderate_question.admin_notes,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'flag' THEN
      UPDATE public.exercise_questions 
      SET 
        moderation_status = 'flagged',
        admin_notes = moderate_question.admin_notes,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'pin' THEN
      UPDATE public.exercise_questions 
      SET 
        is_pinned = true,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'unpin' THEN
      UPDATE public.exercise_questions 
      SET 
        is_pinned = false,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'resolve' THEN
      UPDATE public.exercise_questions 
      SET 
        is_resolved = true,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    WHEN 'unresolve' THEN
      UPDATE public.exercise_questions 
      SET 
        is_resolved = false,
        moderated_by = current_user_id,
        moderated_at = now()
      WHERE id = question_id;
      
    ELSE
      RAISE EXCEPTION 'Invalid moderation action: %', action;
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Fixed moderate_question function ambiguous column reference';
  RAISE NOTICE 'Function now properly references parameter admin_notes';
END $$;