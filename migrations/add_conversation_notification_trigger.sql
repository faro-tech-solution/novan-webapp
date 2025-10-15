-- Migration: Add notification trigger for exercise_submissions_conversation
-- Date: 2024-10-14
-- Description: Create notifications when trainer/admin sends messages in exercise conversations

-- Function to create notification for conversation messages
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_conversation_notification ON exercise_submissions_conversation;

-- Create trigger for conversation notifications
CREATE TRIGGER trigger_conversation_notification
  AFTER INSERT ON exercise_submissions_conversation
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_notification();

-- Comment on function
COMMENT ON FUNCTION create_conversation_notification() IS 
'Creates a notification for the student when a trainer or admin sends a message in the exercise conversation';

-- Comment on trigger
COMMENT ON TRIGGER trigger_conversation_notification ON exercise_submissions_conversation IS 
'Trigger to create notifications when trainer/admin responds to exercise submissions';

