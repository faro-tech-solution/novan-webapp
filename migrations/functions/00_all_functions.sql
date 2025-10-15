-- All Database Functions
-- ======================
-- This file contains all functions organized by category
-- Apply this file to ensure all functions are up to date with the current schema

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