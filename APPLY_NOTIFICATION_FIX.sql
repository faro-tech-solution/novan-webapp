-- ============================================================================
-- QUICK FIX: Exercise Conversation Notifications
-- ============================================================================
-- This script fixes the notification system for exercise conversations
-- Apply this in your Supabase SQL Editor
-- Date: 2024-10-14
-- ============================================================================

-- Step 1: Update existing notification functions to remove 'link' column
-- =========================================================================

-- Function to create notification for exercise feedback (direct feedback field)
CREATE OR REPLACE FUNCTION create_feedback_notification()
RETURNS TRIGGER AS $$
DECLARE
    course_id UUID;
BEGIN
    -- Only create notification when feedback is updated
    IF OLD.feedback IS DISTINCT FROM NEW.feedback AND NEW.feedback IS NOT NULL THEN
        -- Get course_id from exercise
        SELECT e.course_id INTO course_id
        FROM exercises e
        WHERE e.id = NEW.exercise_id;
        
        INSERT INTO notifications (
            title,
            description,
            receiver_id,
            type,
            sender_id,
            course_id,
            metadata
        )
        VALUES (
            'new_feedback_received',
            NEW.feedback,
            NEW.student_id,
            'exercise_feedback',
            NEW.graded_by,
            course_id,
            jsonb_build_object(
                'exercise_id', NEW.exercise_id,
                'submission_id', NEW.id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for award achievement
CREATE OR REPLACE FUNCTION create_award_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        title,
        description,
        receiver_id,
        type,
        metadata
    )
    VALUES (
        'new_award_achieved: ' || (SELECT code FROM awards WHERE id = NEW.award_id),
        'congratulations_earned_new_award',
        NEW.student_id,
        'award_achieved',
        jsonb_build_object(
            'award_id', NEW.award_id,
            'achievement_id', NEW.id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create NEW function for conversation notifications
-- ===========================================================

CREATE OR REPLACE FUNCTION create_conversation_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_role TEXT;
    student_id UUID;
    exercise_id UUID;
    course_id UUID;
BEGIN
    -- Get the sender's role
    SELECT role INTO sender_role
    FROM profiles
    WHERE id = NEW.sender_id;
    
    -- Only create notification if sender is trainer or admin
    IF sender_role IN ('trainer', 'admin') THEN
        -- Get the student_id, exercise_id, and course_id from the submission
        SELECT es.student_id, es.exercise_id, e.course_id
        INTO student_id, exercise_id, course_id
        FROM exercise_submissions es
        JOIN exercises e ON e.id = es.exercise_id
        WHERE es.id = NEW.submission_id;
        
        -- Create notification for the student
        INSERT INTO notifications (
            title,
            description,
            receiver_id,
            type,
            sender_id,
            course_id,
            metadata
        )
        VALUES (
            'new_feedback_received',
            COALESCE(NEW.message, 'پاسخ جدید به تمرین شما'),
            student_id,
            'exercise_feedback',
            NEW.sender_id,
            course_id,
            jsonb_build_object(
                'exercise_id', exercise_id,
                'submission_id', NEW.submission_id,
                'conversation_message_id', NEW.id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger for conversation notifications
-- ======================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_conversation_notification ON exercise_submissions_conversation;

-- Create trigger for conversation notifications
CREATE TRIGGER trigger_conversation_notification
  AFTER INSERT ON exercise_submissions_conversation
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_notification();

-- Step 4: Add comments for documentation
-- =======================================

COMMENT ON FUNCTION create_conversation_notification() IS 
'Creates a notification for the student when a trainer or admin sends a message in the exercise conversation';

COMMENT ON TRIGGER trigger_conversation_notification ON exercise_submissions_conversation IS 
'Trigger to create notifications when trainer/admin responds to exercise submissions';

-- Step 5: Verify installation
-- ============================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname = 'trigger_conversation_notification';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ SUCCESS: Conversation notification trigger installed successfully!';
        RAISE NOTICE '   Trainer/admin messages will now create notifications for students.';
    ELSE
        RAISE WARNING '⚠️  WARNING: Trigger may not have been created properly.';
    END IF;
END $$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
-- 
-- NEXT STEPS:
-- 1. Test by having an admin/trainer send a message in an exercise conversation
-- 2. Verify the student receives a notification
-- 3. Check the notifications table to see the new entry
--
-- ROLLBACK (if needed):
-- DROP TRIGGER IF EXISTS trigger_conversation_notification ON exercise_submissions_conversation;
-- DROP FUNCTION IF EXISTS create_conversation_notification();
-- ============================================================================

