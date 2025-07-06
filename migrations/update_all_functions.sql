-- Update All Functions Migration
-- ==============================
-- This migration updates all functions to be compatible with the current database schema
-- and removes any references to non-existent columns

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS handle_new_enrollment() CASCADE;
DROP FUNCTION IF EXISTS handle_new_submission() CASCADE;

-- Drop all existing functions to ensure clean replacement
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_trainer_or_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_award_achievements(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_check_achievements() CASCADE;
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_feedback_notification() CASCADE;
DROP FUNCTION IF EXISTS create_award_notification() CASCADE;
DROP FUNCTION IF EXISTS get_latest_notifications(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_unread_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_balance(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_student_balance(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_course_purchase() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_student_enrolled_in_course(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.log_student_activity(UUID, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS handle_exercise_submission_activity() CASCADE;

-- User Management Functions
-- ========================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    role,
    gender,
    job,
    education,
    phone_number,
    country,
    city,
    birthday,
    ai_familiarity,
    english_level,
    telegram_id,
    whatsapp_id
  )
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'trainee'),
    new.raw_user_meta_data ->> 'gender',
    new.raw_user_meta_data ->> 'job',
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    (new.raw_user_meta_data ->> 'birthday')::date,
    new.raw_user_meta_data ->> 'ai_familiarity',
    new.raw_user_meta_data ->> 'english_level',
    new.raw_user_meta_data ->> 'telegram_id',
    new.raw_user_meta_data ->> 'whatsapp_id'
  );
  RETURN new;
END;
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is trainer or admin
CREATE OR REPLACE FUNCTION is_trainer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('trainer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Achievement System Functions
-- ============================

-- Function to check and award achievements based on student activity
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(student_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exercise_count INTEGER;
  perfect_scores INTEGER;
  high_scores INTEGER;
  total_points INTEGER;
  consecutive_days INTEGER;
BEGIN
  -- Check First Submission
  SELECT COUNT(*) INTO exercise_count
  FROM exercise_submissions 
  WHERE student_id = student_id_param;
  
  IF exercise_count >= 1 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE code = 'first_submission'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Check Perfect Score
  SELECT COUNT(*) INTO perfect_scores
  FROM exercise_submissions 
  WHERE student_id = student_id_param AND score = 100;
  
  IF perfect_scores >= 1 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE code = 'perfect_score'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Check Exercise Enthusiast (25 exercises)
  IF exercise_count >= 25 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE code = 'exercise_enthusiast'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Check Century Club (100 exercises)
  IF exercise_count >= 100 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE code = 'century_club'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Add more achievement checks here as needed
END;
$$;

-- Trigger function to check achievements after exercise submission
CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.check_and_award_achievements(NEW.student_id);
  RETURN NEW;
END;
$$;

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

-- Accounting System Functions
-- ===========================

-- Function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) FROM accounting WHERE accounting.user_id = $1),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate student balance
CREATE OR REPLACE FUNCTION calculate_student_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_balance INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_balance
    FROM accounting
    WHERE user_id = p_user_id;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle course purchase
CREATE OR REPLACE FUNCTION handle_course_purchase()
RETURNS TRIGGER AS $$
DECLARE
    course_price INTEGER;
BEGIN
    -- Get the course price
    SELECT price INTO course_price
    FROM courses
    WHERE id = NEW.course_id;

    -- Only create accounting record if course has a price
    IF course_price > 0 THEN
        -- Insert negative amount for course purchase
        INSERT INTO accounting (
            user_id,
            course_id,
            amount,
            description,
            payment_status,
            payment_type
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            -course_price,
            'خرید دوره',
            'completed',
            'buy_course'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility Functions
-- =================

-- Function to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp (alias for set_updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if student is enrolled in course
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_course(course_id uuid, student_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE course_id = $1 AND student_id = $2 AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log student activity
CREATE OR REPLACE FUNCTION public.log_student_activity(
  p_student_id UUID,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  -- This function would log student activity to a daily_activities table
  -- Implementation depends on your activity logging requirements
  -- For now, this is a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle exercise submission activity
CREATE OR REPLACE FUNCTION handle_exercise_submission_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log activity when exercise is submitted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_student_activity(
      NEW.student_id,
      'exercise_submission',
      'Submitted exercise: ' || (SELECT title FROM exercises WHERE id = NEW.exercise_id),
      jsonb_build_object(
        'exercise_id', NEW.exercise_id,
        'submission_id', NEW.id,
        'score', NEW.score
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 