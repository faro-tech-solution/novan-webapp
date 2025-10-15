-- Update Notification Redirect URLs and Translation Keys
-- ======================================================
-- This migration updates the notification creation functions to use the correct redirect URLs
-- and translation keys instead of hardcoded English text:
-- - award_achieved notifications should redirect to /progress
-- - exercise_feedback notifications should redirect to /exercise/{exercise_id}
-- - All notification titles and descriptions now use translation keys

-- Drop existing functions to ensure clean replacement
DROP FUNCTION IF EXISTS create_feedback_notification() CASCADE;
DROP FUNCTION IF EXISTS create_award_notification() CASCADE;

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

-- Recreate the triggers
DROP TRIGGER IF EXISTS trigger_feedback_notification ON exercise_submissions;
CREATE TRIGGER trigger_feedback_notification
  AFTER UPDATE ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_notification();

DROP TRIGGER IF EXISTS trigger_award_notification ON student_awards;
CREATE TRIGGER trigger_award_notification
  AFTER INSERT ON student_awards
  FOR EACH ROW
  EXECUTE FUNCTION create_award_notification();

-- Log the update
DO $$
BEGIN
    RAISE NOTICE 'Notification redirect URLs and translation keys updated successfully:';
    RAISE NOTICE '- award_achieved notifications now redirect to /progress';
    RAISE NOTICE '- exercise_feedback notifications now redirect to /exercise/{exercise_id}';
    RAISE NOTICE '- All notification titles and descriptions now use translation keys';
END $$; 