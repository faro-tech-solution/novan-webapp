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