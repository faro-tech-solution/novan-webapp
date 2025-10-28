-- Exercise Q&A System Functions
-- ==============================
-- This file contains all functions for the Q&A system

-- ========================================
-- FUNCTION 1: Update Vote Count
-- ========================================

-- Function to automatically update vote_count when votes are added, changed, or removed
CREATE OR REPLACE FUNCTION update_qa_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: add vote to count
  IF TG_OP = 'INSERT' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count + NEW.vote_type
    WHERE id = NEW.exercise_qa_id;
    
  -- Handle DELETE: remove vote from count
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count - OLD.vote_type
    WHERE id = OLD.exercise_qa_id;
    
  -- Handle UPDATE: adjust count for vote change (e.g., upvote to downvote)
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.exercise_qa_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION update_qa_vote_count() IS 'Automatically updates vote_count in exercise_qa when votes are added, changed, or removed';

-- ========================================
-- FUNCTION 2: Notify Instructor of New Question
-- ========================================

-- Function to send notification to instructor when a new question is posted
CREATE OR REPLACE FUNCTION notify_trainer_new_question()
RETURNS TRIGGER AS $$
DECLARE
  trainer_id UUID;
  course_id_var UUID;
  exercise_title TEXT;
BEGIN
  -- Only trigger for main questions (not answers/replies)
  IF NEW.parent_id IS NULL THEN
    -- Find instructor, course ID, and exercise title
    SELECT c.instructor_id, c.id, e.title 
    INTO trainer_id, course_id_var, exercise_title
    FROM exercises e
    JOIN courses c ON c.id = e.course_id
    WHERE e.id = NEW.exercise_id;
    
    -- Only create notification if instructor exists and is different from question author
    IF trainer_id IS NOT NULL AND trainer_id != NEW.user_id THEN
      -- Create notification for instructor
      INSERT INTO notifications (
        title, 
        description, 
        receiver_id, 
        type, 
        course_id, 
        sender_id, 
        metadata
      ) VALUES (
        'new_question_in_exercise',
        'A new question was posted in exercise "' || exercise_title || '"',
        trainer_id,
        'system',
        course_id_var,
        NEW.user_id,
        jsonb_build_object(
          'exercise_id', NEW.exercise_id,
          'qa_id', NEW.id,
          'link', '/exercise/' || NEW.exercise_id || '/qa/' || NEW.id,
          'qa_type', 'question',
          'question_title', NEW.title
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION notify_trainer_new_question() IS 'Sends notification to course instructor when a new question is posted';

-- ========================================
-- FUNCTION 3: Notify Parent Author of Reply
-- ========================================

-- Function to send notification to parent post author when someone replies
CREATE OR REPLACE FUNCTION notify_answer_to_question()
RETURNS TRIGGER AS $$
DECLARE
  parent_user_id UUID;
  parent_exercise_id UUID;
  course_id_var UUID;
  exercise_title TEXT;
  parent_title TEXT;
BEGIN
  -- Only trigger for answers/replies (not main questions)
  IF NEW.parent_id IS NOT NULL THEN
    -- Find parent post author and exercise
    SELECT user_id, exercise_id, title
    INTO parent_user_id, parent_exercise_id, parent_title
    FROM exercise_qa
    WHERE id = NEW.parent_id;
    
    -- Only create notification if reply author is different from parent author
    IF parent_user_id IS NOT NULL AND parent_user_id != NEW.user_id THEN
      -- Find exercise information
      SELECT e.title, e.course_id 
      INTO exercise_title, course_id_var
      FROM exercises e
      WHERE e.id = parent_exercise_id;
      
      -- Create notification for parent post author
      INSERT INTO notifications (
        title, 
        description, 
        receiver_id, 
        type, 
        course_id, 
        sender_id, 
        metadata
      ) VALUES (
        'new_reply_to_your_post',
        'Someone replied to your ' || 
        CASE WHEN parent_title IS NOT NULL THEN 'question' ELSE 'answer' END ||
        ' in exercise "' || exercise_title || '"',
        parent_user_id,
        'system',
        course_id_var,
        NEW.user_id,
        jsonb_build_object(
          'exercise_id', parent_exercise_id,
          'parent_qa_id', NEW.parent_id,
          'reply_id', NEW.id,
          'link', '/exercise/' || parent_exercise_id || '/qa/' || NEW.parent_id,
          'qa_type', 'answer',
          'parent_title', parent_title
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION notify_answer_to_question() IS 'Sends notification to parent post author when someone replies to their question/answer';

-- ========================================
-- LOG COMPLETION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Exercise Q&A functions created successfully:';
    RAISE NOTICE '- update_qa_vote_count(): Updates vote counts automatically';
    RAISE NOTICE '- notify_trainer_new_question(): Notifies instructor of new questions';
    RAISE NOTICE '- notify_answer_to_question(): Notifies parent author of replies';
END $$;
