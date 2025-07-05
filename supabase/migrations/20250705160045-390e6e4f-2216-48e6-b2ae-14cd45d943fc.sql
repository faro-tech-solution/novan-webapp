-- Script to check and verify awards table content after migration
-- Run this script to diagnose issues with missing awards

-- Check if all expected awards exist in the awards table (post-migration structure)
SELECT code, icon, points_value, rarity, category 
FROM awards 
ORDER BY category, code;

-- Count awards by category
SELECT category, COUNT(*) 
FROM awards 
GROUP BY category 
ORDER BY category;

-- Check if there are any student awards
SELECT count(*) as total_student_awards 
FROM student_awards;

-- Look at a sample of student awards
SELECT sa.id, sa.student_id, sa.award_id, sa.earned_at, 
       a.code as award_code, a.rarity, a.category
FROM student_awards sa
JOIN awards a ON sa.award_id = a.id
LIMIT 10;

-- Check if any of the expected award codes are missing
DO $$
DECLARE
  expected_awards TEXT[] := ARRAY[
    'first_submission', 'perfect_score', 'high_achiever', 
    'academic_excellence', 'early_bird', 'exercise_enthusiast', 
    'century_club', 'night_owl', 'weekend_warrior',
    'on_time', 'streak_master', 'monthly_warrior',
    'never_give_up', 'fast_learner', 'speed_demon',
    'top_student'
  ];
  missing_award TEXT;
BEGIN
  FOREACH missing_award IN ARRAY expected_awards LOOP
    IF NOT EXISTS (SELECT 1 FROM awards WHERE code = missing_award) THEN
      RAISE NOTICE 'Missing award code: %', missing_award;
    END IF;
  END LOOP;
END $$;

-- Check the backup translations table
SELECT * FROM award_translations_backup
ORDER BY code;
