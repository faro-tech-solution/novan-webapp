-- Migration: Add Q&A Moderation Features
-- Date: 2025-01-27
-- Description: Adds moderation capabilities and improves Q&A structure for admin management

BEGIN;

-- 1. Add moderation fields to exercise_questions table
ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' 
CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));

ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false;

ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- 2. Add reply_count field for better performance (denormalized for efficiency)
ALTER TABLE public.exercise_questions 
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_questions_moderation_status 
ON public.exercise_questions(moderation_status);

CREATE INDEX IF NOT EXISTS idx_exercise_questions_is_pinned 
ON public.exercise_questions(is_pinned);

CREATE INDEX IF NOT EXISTS idx_exercise_questions_is_resolved 
ON public.exercise_questions(is_resolved);

CREATE INDEX IF NOT EXISTS idx_exercise_questions_reply_count 
ON public.exercise_questions(reply_count);

CREATE INDEX IF NOT EXISTS idx_exercise_questions_moderated_by 
ON public.exercise_questions(moderated_by);

-- 4. Create function to update reply counts
CREATE OR REPLACE FUNCTION update_question_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reply count for the parent question
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE public.exercise_questions 
    SET reply_count = (
      SELECT COUNT(*) 
      FROM public.exercise_questions 
      WHERE parent_id = NEW.parent_id 
      AND is_deleted = false
    )
    WHERE id = NEW.parent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update reply counts
DROP TRIGGER IF EXISTS trigger_update_reply_count ON public.exercise_questions;
CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR UPDATE OR DELETE ON public.exercise_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_reply_count();

-- 6. Update existing reply counts
UPDATE public.exercise_questions 
SET reply_count = (
  SELECT COUNT(*) 
  FROM public.exercise_questions eq2 
  WHERE eq2.parent_id = exercise_questions.id 
  AND eq2.is_deleted = false
)
WHERE parent_id IS NULL;

-- 7. Add RLS policies for moderation features
DROP POLICY IF EXISTS "Admins can moderate questions" ON public.exercise_questions;
CREATE POLICY "Admins can moderate questions"
  ON public.exercise_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- 8. Create function to handle moderation actions
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

-- 9. Add comments
COMMENT ON COLUMN public.exercise_questions.moderation_status IS 'Moderation status: pending, approved, rejected, flagged';
COMMENT ON COLUMN public.exercise_questions.is_pinned IS 'Whether the question is pinned by admin';
COMMENT ON COLUMN public.exercise_questions.is_resolved IS 'Whether the question is marked as resolved';
COMMENT ON COLUMN public.exercise_questions.admin_notes IS 'Admin notes for moderation decisions';
COMMENT ON COLUMN public.exercise_questions.moderated_by IS 'Admin who performed the moderation';
COMMENT ON COLUMN public.exercise_questions.moderated_at IS 'When the moderation was performed';
COMMENT ON COLUMN public.exercise_questions.reply_count IS 'Number of replies (denormalized for performance)';

COMMIT;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Q&A moderation features migration completed successfully';
  RAISE NOTICE 'Added fields: moderation_status, is_pinned, is_resolved, admin_notes, moderated_by, moderated_at, reply_count';
  RAISE NOTICE 'Created moderation function and triggers';
  RAISE NOTICE 'Updated existing reply counts';
END $$;