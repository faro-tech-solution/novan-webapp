-- Notification System Functions
-- =============================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = true,
        read_at = now()
    WHERE id = notification_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for exercise feedback
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

-- Function to get latest notifications
CREATE OR REPLACE FUNCTION get_latest_notifications(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type notification_type,
    created_at TIMESTAMPTZ,
    is_read BOOLEAN,
    link TEXT,
    metadata JSONB,
    sender_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.type,
        n.created_at,
        n.is_read,
        n.link,
        n.metadata,
        n.sender_id
    FROM notifications n
    WHERE n.receiver_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE receiver_id = p_user_id AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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