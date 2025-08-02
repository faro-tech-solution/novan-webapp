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
BEGIN
    -- Only create notification when feedback is updated
    IF OLD.feedback IS DISTINCT FROM NEW.feedback AND NEW.feedback IS NOT NULL THEN
        INSERT INTO notifications (
            title,
            description,
            receiver_id,
            type,
            link,
            sender_id,
            metadata
        )
        VALUES (
            'new_feedback_received',
            NEW.feedback,
            NEW.student_id,
            'exercise_feedback',
            '/exercise/' || NEW.exercise_id,
            NEW.graded_by,
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
        link,
        metadata
    )
    VALUES (
        'new_award_achieved: ' || (SELECT code FROM awards WHERE id = NEW.award_id),
        'congratulations_earned_new_award',
        NEW.student_id,
        'award_achieved',
        '/progress',
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