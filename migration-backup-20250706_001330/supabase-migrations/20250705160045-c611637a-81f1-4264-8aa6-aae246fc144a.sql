-- Create notifications table
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('exercise_feedback', 'award_achieved', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ,
    link TEXT,
    type notification_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Additional fields for flexibility
    sender_id UUID REFERENCES auth.users(id),
    priority TEXT DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    icon TEXT,
    
    -- Add indexes for common queries
    CONSTRAINT valid_read_at CHECK (
        (is_read = false AND read_at IS NULL) OR
        (is_read = true AND read_at IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_feedback_updated ON exercise_submissions;
DROP TRIGGER IF EXISTS on_award_achieved ON student_awards;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_feedback_notification();
DROP FUNCTION IF EXISTS create_award_notification();
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID);
DROP FUNCTION IF EXISTS get_latest_notifications(UUID, INTEGER);

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
            'New Feedback Received',
            NEW.feedback,
            NEW.student_id,
            'exercise_feedback',
            '/exercises/' || NEW.exercise_id,
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

-- Trigger for exercise feedback
CREATE TRIGGER on_feedback_updated
    AFTER UPDATE OF feedback ON exercise_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_feedback_notification();

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
        'New Award Achieved: ' || (SELECT title FROM awards WHERE id = NEW.award_id),
        'Congratulations! You have earned a new award.',
        NEW.student_id,
        'award_achieved',
        '/profile/awards',
        jsonb_build_object(
            'award_id', NEW.award_id,
            'achievement_id', NEW.id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for award achievements
CREATE TRIGGER on_award_achieved
    AFTER INSERT ON student_awards
    FOR EACH ROW
    EXECUTE FUNCTION create_award_notification();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = receiver_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to get latest notifications
CREATE OR REPLACE FUNCTION get_latest_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    link TEXT,
    type notification_type,
    metadata JSONB,
    sender_id UUID,
    priority TEXT,
    icon TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.is_read,
        n.created_at,
        n.read_at,
        n.link,
        n.type,
        n.metadata,
        n.sender_id,
        n.priority,
        n.icon
    FROM notifications n
    WHERE n.receiver_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
