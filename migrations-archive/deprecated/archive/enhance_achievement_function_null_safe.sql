-- Enhance the check_and_award_achievements function to support more achievements
-- This version fixes all ambiguous column references and null value handling

-- Drop the old function version
DROP FUNCTION IF EXISTS public.check_and_award_achievements(UUID);

-- Create the enhanced version of the function
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(student_id_param UUID)
RETURNS SETOF TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exercise_count INTEGER;
  perfect_scores INTEGER;
  high_scores INTEGER;
  avg_score NUMERIC;
  consecutive_days INTEGER;
  early_submissions INTEGER;
  on_time_submissions INTEGER;
  result_message TEXT;
  award_id_var UUID;  -- renamed to avoid ambiguity
  award_name TEXT;
  was_awarded BOOLEAN;
  now_time TIME;
  now_date DATE;
  is_weekend BOOLEAN;
BEGIN
  -- Initialize result array for logging/debugging
  result_message := 'Starting achievement check for student: ' || student_id_param;
  RETURN NEXT result_message;

  -- Get current time info
  now_time := CURRENT_TIME;
  now_date := CURRENT_DATE;
  is_weekend := EXTRACT(DOW FROM now_date) IN (6, 0); -- Saturday=6, Sunday=0

  -- Count total submissions
  SELECT COUNT(*) INTO exercise_count
  FROM exercise_submissions 
  WHERE exercise_submissions.student_id = student_id_param;
  
  result_message := 'Found ' || exercise_count || ' total exercise submissions';
  RETURN NEXT result_message;

  -- Check First Submission
  IF exercise_count >= 1 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'First Submission';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''First Submission''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Perfect Score
  SELECT COUNT(*) INTO perfect_scores
  FROM exercise_submissions 
  WHERE exercise_submissions.student_id = student_id_param 
  AND exercise_submissions.score = 100;
  
  result_message := 'Found ' || perfect_scores || ' perfect scores';
  RETURN NEXT result_message;
  
  IF perfect_scores >= 1 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Perfect Score';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Perfect Score''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check High Achiever (90%+ on 5 exercises)
  SELECT COUNT(*) INTO high_scores
  FROM exercise_submissions 
  WHERE exercise_submissions.student_id = student_id_param 
  AND exercise_submissions.score >= 90;
  
  result_message := 'Found ' || high_scores || ' high scores (90%+)';
  RETURN NEXT result_message;
  
  IF high_scores >= 5 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'High Achiever';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''High Achiever''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Academic Excellence (95%+ average across 10+ exercises)
  IF exercise_count >= 10 THEN
    SELECT AVG(exercise_submissions.score) INTO avg_score
    FROM exercise_submissions 
    WHERE exercise_submissions.student_id = student_id_param 
    AND exercise_submissions.score IS NOT NULL;
    
    result_message := 'Average score across ' || exercise_count || ' exercises: ' || avg_score;
    RETURN NEXT result_message;
    
    IF avg_score >= 95 THEN
      SELECT awards.id, awards.name INTO award_id_var, award_name 
      FROM awards 
      WHERE awards.name = 'Academic Excellence';
      
      -- Check if we found the award
      IF award_id_var IS NOT NULL THEN
        INSERT INTO student_awards (student_id, award_id, bonus_points)
        SELECT 
          student_id_param, 
          award_id_var, 
          (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
        WHERE NOT EXISTS (
          SELECT 1 FROM student_awards 
          WHERE student_awards.student_id = student_id_param 
          AND student_awards.award_id = award_id_var
        )
        RETURNING TRUE INTO was_awarded;
        
        IF was_awarded THEN
          result_message := 'Awarded: ' || award_name;
          RETURN NEXT result_message;
        END IF;
      ELSE
        result_message := 'Warning: Could not find award with name ''Academic Excellence''';
        RETURN NEXT result_message;
      END IF;
    END IF;
  END IF;

  -- Check Early Bird (submit 5 exercises before due date)
  SELECT COUNT(*) INTO early_submissions
  FROM exercise_submissions es
  JOIN exercises e ON es.exercise_id = e.id
  WHERE es.student_id = student_id_param
  AND es.submitted_at < (e.created_at + (e.days_to_due * INTERVAL '1 day'));
  
  result_message := 'Found ' || early_submissions || ' early submissions';
  RETURN NEXT result_message;
  
  IF early_submissions >= 5 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Early Bird';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Early Bird''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Exercise Enthusiast (25 exercises)
  IF exercise_count >= 25 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Exercise Enthusiast';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Exercise Enthusiast''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Century Club (100 exercises)
  IF exercise_count >= 100 THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Century Club';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Century Club''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Night Owl (submit between 10PM-6AM)
  IF (now_time >= '22:00:00' OR now_time <= '06:00:00') THEN
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Night Owl';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Night Owl''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Check Weekend Warrior (submit on weekend)
  IF is_weekend THEN
    -- Check if user already has a submission from the other weekend day
    -- For now, we'll just give it if they submit on any weekend day
    SELECT awards.id, awards.name INTO award_id_var, award_name 
    FROM awards 
    WHERE awards.name = 'Weekend Warrior';
    
    -- Check if we found the award
    IF award_id_var IS NOT NULL THEN
      INSERT INTO student_awards (student_id, award_id, bonus_points)
      SELECT 
        student_id_param, 
        award_id_var, 
        (SELECT awards.points_value FROM awards WHERE awards.id = award_id_var)
      WHERE NOT EXISTS (
        SELECT 1 FROM student_awards 
        WHERE student_awards.student_id = student_id_param 
        AND student_awards.award_id = award_id_var
      )
      RETURNING TRUE INTO was_awarded;
      
      IF was_awarded THEN
        result_message := 'Awarded: ' || award_name;
        RETURN NEXT result_message;
      END IF;
    ELSE
      result_message := 'Warning: Could not find award with name ''Weekend Warrior''';
      RETURN NEXT result_message;
    END IF;
  END IF;

  -- Return final message
  result_message := 'Achievement check completed for student: ' || student_id_param;
  RETURN NEXT result_message;
END;
$$;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;

-- Drop the old function version of the trigger function if it exists
DROP FUNCTION IF EXISTS public.trigger_check_achievements() CASCADE;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Explicitly use the student_id from NEW record
  PERFORM public.check_and_award_achievements(NEW.student_id);
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER after_exercise_submission
  AFTER INSERT OR UPDATE ON public.exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_achievements();

-- Comment explaining the migration
COMMENT ON FUNCTION public.check_and_award_achievements(UUID) IS 'Enhanced version that checks for more achievements and returns debug logs, with all ambiguous column references fixed and null value handling';
