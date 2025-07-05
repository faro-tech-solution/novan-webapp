
-- Create awards table to define all available awards
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_awards table to track which awards students have earned
CREATE TABLE public.student_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  award_id UUID NOT NULL REFERENCES public.awards(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, award_id)
);

-- Enable RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_awards ENABLE ROW LEVEL SECURITY;

-- RLS policies for awards (everyone can read awards)
CREATE POLICY "Everyone can view awards" 
  ON public.awards 
  FOR SELECT 
  USING (true);

-- RLS policies for student_awards (students can only see their own)
CREATE POLICY "Students can view their own awards" 
  ON public.student_awards 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Insert the predefined awards
INSERT INTO public.awards (name, description, icon, points_value, rarity, category) VALUES
-- Academic Performance Awards
('First Submission', 'Complete your first exercise', 'award', 50, 'common', 'academic'),
('Perfect Score', 'Get 100% on any exercise', 'award', 100, 'uncommon', 'academic'),
('High Achiever', 'Get 90%+ on 5 exercises', 'award', 200, 'rare', 'academic'),
('Academic Excellence', 'Get 95%+ average across 10 exercises', 'award', 300, 'epic', 'academic'),
('Top Student', 'Rank #1 in class for a month', 'award', 500, 'legendary', 'academic'),

-- Consistency & Dedication Awards
('Early Bird', 'Submit 5 exercises before the due date', 'award', 100, 'common', 'consistency'),
('On Time', 'Submit 10 exercises on or before due date', 'award', 150, 'uncommon', 'consistency'),
('Streak Master', 'Submit exercises for 7 consecutive days', 'award', 200, 'rare', 'consistency'),
('Monthly Warrior', 'Complete all exercises in a month', 'award', 300, 'epic', 'consistency'),
('Never Give Up', 'Complete an overdue exercise', 'award', 75, 'common', 'consistency'),

-- Progress & Improvement Awards
('Fast Learner', 'Complete 3 exercises in one day', 'award', 100, 'uncommon', 'progress'),
('Speed Demon', 'Complete an exercise in under estimated time', 'award', 75, 'common', 'progress'),
('Improvement Champion', 'Show 20% improvement in average scores', 'award', 250, 'rare', 'progress'),
('Comeback Kid', 'Improve from failing to passing grade', 'award', 150, 'uncommon', 'progress'),
('Progress Tracker', 'Complete exercises in 3 different difficulty levels', 'award', 100, 'common', 'progress'),

-- Engagement & Participation Awards
('Course Explorer', 'Enroll in 3 different courses', 'award', 100, 'common', 'engagement'),
('Active Learner', 'Log in for 15 consecutive days', 'award', 200, 'uncommon', 'engagement'),
('Exercise Enthusiast', 'Complete 25 exercises total', 'award', 150, 'uncommon', 'engagement'),
('Century Club', 'Complete 100 exercises', 'award', 500, 'epic', 'engagement'),
('Course Completer', 'Complete all exercises in a course', 'award', 300, 'rare', 'engagement'),

-- Special Recognition Awards
('Night Owl', 'Submit exercise between 10 PM - 6 AM', 'award', 50, 'common', 'special'),
('Weekend Warrior', 'Submit exercises on both Saturday and Sunday', 'award', 100, 'uncommon', 'special'),
('Holiday Hero', 'Submit exercise on a holiday', 'award', 75, 'uncommon', 'special'),
('Helpful Student', 'Complete extra credit exercises', 'award', 150, 'rare', 'special'),
('Challenge Accepted', 'Complete all hard difficulty exercises', 'award', 400, 'epic', 'special'),

-- Milestone Awards
('Bronze Scholar', 'Earn 500 total points', 'award', 100, 'common', 'milestone'),
('Silver Scholar', 'Earn 1,000 total points', 'award', 200, 'uncommon', 'milestone'),
('Gold Scholar', 'Earn 2,500 total points', 'award', 500, 'rare', 'milestone'),
('Platinum Scholar', 'Earn 5,000 total points', 'award', 1000, 'epic', 'milestone'),
('Diamond Scholar', 'Earn 10,000 total points', 'award', 2000, 'legendary', 'milestone');

-- Create function to check and award achievements
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
    WHERE name = 'First Submission'
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
    WHERE name = 'Perfect Score'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Check Exercise Enthusiast (25 exercises)
  IF exercise_count >= 25 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE name = 'Exercise Enthusiast'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Check Century Club (100 exercises)
  IF exercise_count >= 100 THEN
    INSERT INTO student_awards (student_id, award_id, bonus_points)
    SELECT student_id_param, id, points_value 
    FROM awards 
    WHERE name = 'Century Club'
    ON CONFLICT (student_id, award_id) DO NOTHING;
  END IF;

  -- Add more achievement checks here as needed
END;
$$;

-- Create trigger to check achievements after exercise submission
CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.check_and_award_achievements(NEW.student_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_exercise_submission
  AFTER INSERT OR UPDATE ON public.exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_achievements();
