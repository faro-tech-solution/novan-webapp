# Manual Award System Migration Instructions

If you're having trouble running the automated migration script, you can manually apply the changes by running the SQL commands in this document through the Supabase SQL Editor or another database tool.

## Prerequisites

1. Backup your database
2. Access to Supabase SQL Editor or psql

## Step 1: Add the code column and update award codes

```sql
-- Add a code column if it doesn't exist already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'code'
    ) THEN
        ALTER TABLE public.awards ADD COLUMN code VARCHAR(50);
    ELSE
        RAISE NOTICE 'Column "code" already exists in table "awards", skipping column creation';
    END IF;
END $$;

-- Update award codes for existing awards
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'name'
    ) THEN
        -- Update award codes based on existing names
        UPDATE public.awards SET code = 'first_submission' WHERE name = 'First Submission' OR name = 'تولد یک کدنویس';
        UPDATE public.awards SET code = 'perfect_score' WHERE name = 'Perfect Score' OR name = 'استاد کامل';
        UPDATE public.awards SET code = 'high_achiever' WHERE name = 'High Achiever' OR name = 'نابغه برنامه‌نویسی';
        UPDATE public.awards SET code = 'academic_excellence' WHERE name = 'Academic Excellence';
        UPDATE public.awards SET code = 'top_student' WHERE name = 'Top Student';
        UPDATE public.awards SET code = 'early_bird' WHERE name = 'Early Bird' OR name = 'تکمیل‌کننده زودهنگام';
        UPDATE public.awards SET code = 'on_time' WHERE name = 'On Time' OR name = 'سرباز وقت‌شناس';
        UPDATE public.awards SET code = 'streak_master' WHERE name = 'Streak Master' OR name = 'قهرمان هفت روزه';
        UPDATE public.awards SET code = 'monthly_warrior' WHERE name = 'Monthly Warrior' OR name = 'جنگجوی ماهانه';
        UPDATE public.awards SET code = 'never_give_up' WHERE name = 'Never Give Up' OR name = 'هرگز تسلیم نشو';
        UPDATE public.awards SET code = 'fast_learner' WHERE name = 'Fast Learner' OR name = 'یادگیر سریع';
        UPDATE public.awards SET code = 'speed_demon' WHERE name = 'Speed Demon' OR name = 'شیطان سرعت';
        UPDATE public.awards SET code = 'exercise_enthusiast' WHERE name = 'Exercise Enthusiast';
        UPDATE public.awards SET code = 'century_club' WHERE name = 'Century Club';
        UPDATE public.awards SET code = 'night_owl' WHERE name = 'Night Owl';
        UPDATE public.awards SET code = 'weekend_warrior' WHERE name = 'Weekend Warrior';

        -- Handle any remaining awards that might not have been covered
        UPDATE public.awards SET code = LOWER(REPLACE(REPLACE(name, ' ', '_'), '-', '_'))
        WHERE code IS NULL;
    ELSE
        -- Insert new awards with codes if they don't exist yet
        INSERT INTO public.awards (code, icon, points_value, rarity, category)
        VALUES 
            ('first_submission', '🎉', 50, 'common', 'achievement'),
            ('perfect_score', '🏆', 100, 'rare', 'academic'),
            ('high_achiever', '⭐', 150, 'rare', 'academic'),
            ('academic_excellence', '🎓', 200, 'epic', 'academic'),
            ('top_student', '👑', 250, 'legendary', 'academic'),
            ('early_bird', '⏰', 50, 'common', 'diligence'),
            ('on_time', '📅', 100, 'common', 'diligence'),
            ('streak_master', '🔥', 150, 'rare', 'diligence'),
            ('monthly_warrior', '💪', 200, 'epic', 'diligence'),
            ('never_give_up', '🚀', 100, 'common', 'persistence'),
            ('fast_learner', '⚡', 150, 'rare', 'skill'),
            ('speed_demon', '💨', 150, 'rare', 'skill'),
            ('exercise_enthusiast', '🧩', 200, 'epic', 'volume'),
            ('century_club', '💯', 250, 'legendary', 'volume'),
            ('night_owl', '🦉', 100, 'uncommon', 'special'),
            ('weekend_warrior', '🛡️', 100, 'uncommon', 'special')
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- Make the code column NOT NULL and create a unique index
DO $$
BEGIN
    -- Check if the column exists and is not already NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'code'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.awards ALTER COLUMN code SET NOT NULL;
    END IF;
END $$;

-- Create unique index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'awards'
        AND indexname = 'awards_code_idx'
    ) THEN
        CREATE UNIQUE INDEX awards_code_idx ON public.awards(code);
    ELSE
        RAISE NOTICE 'Index "awards_code_idx" already exists, skipping creation';
    END IF;
END $$;
```

## Step 2: Create a backup of award translations

```sql
-- Create backup table
CREATE TABLE IF NOT EXISTS public.award_translations_backup (
  code VARCHAR(50) PRIMARY KEY,
  en_name TEXT,
  en_description TEXT,
  fa_name TEXT,
  fa_description TEXT
);

-- Backup existing translations if name/description columns exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'name'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'description'
    ) THEN
        INSERT INTO public.award_translations_backup (code, en_name, en_description)
        SELECT code, name, description
        FROM public.awards
        ON CONFLICT (code) DO UPDATE SET
            en_name = EXCLUDED.en_name,
            en_description = EXCLUDED.en_description;
    ELSE
        RAISE NOTICE 'Name and/or description columns do not exist in awards table, skipping backup from awards table';
    END IF;
END $$;

-- Insert English and Persian translations
INSERT INTO public.award_translations_backup (code, en_name, en_description, fa_name, fa_description)
VALUES
  ('first_submission', 'First Submission', 'Complete your first exercise submission', 'تولد یک کدنویس', '🎉 اولین قدم در دنیای برنامه‌نویسی! شما اولین تمرین خود را تکمیل کردید'),
  ('perfect_score', 'Perfect Score', 'Get a perfect 100% score on an exercise', 'استاد کامل', '🏆 نمره کامل! شما در یکی از تمرین‌ها نمره ۱۰۰ گرفتید'),
  ('high_achiever', 'High Achiever', 'Score 90% or higher on 5 different exercises', 'نابغه برنامه‌نویسی', '⭐ شما در ۵ تمرین نمره ۹۰ یا بالاتر کسب کردید'),
  ('early_bird', 'Early Bird', 'Submit 5 exercises before their deadline', 'تکمیل‌کننده زودهنگام', '⏰ شما ۵ تمرین را قبل از موعد مقرر تحویل دادید'),
  ('on_time', 'On Time', 'Submit 10 exercises by their deadline', 'سرباز وقت‌شناس', '📅 شما ۱۰ تمرین را در موعد مقرر تحویل دادید'),
  ('streak_master', 'Streak Master', 'Submit exercises for 7 days in a row', 'قهرمان هفت روزه', '🔥 شما ۷ روز متوالی تمرین تحویل دادید'),
  ('monthly_warrior', 'Monthly Warrior', 'Complete all exercises in a month', 'جنگجوی ماهانه', '💪 شما تمام تمرین‌های یک ماه را تکمیل کردید'),
  ('never_give_up', 'Never Give Up', 'Complete an overdue exercise', 'هرگز تسلیم نشو', '🚀 شما یک تمرین معوقه را تکمیل کردید'),
  ('fast_learner', 'Fast Learner', 'Complete 3 exercises in a single day', 'یادگیر سریع', '⚡ شما ۳ تمرین را در یک روز تکمیل کردید'),
  ('speed_demon', 'Speed Demon', 'Complete an exercise in less than the estimated time', 'شیطان سرعت', '💨 شما تمرینی را در کمتر از زمان تخمینی تکمیل کردید'),
  ('exercise_enthusiast', 'Exercise Enthusiast', 'Complete 25 different exercises', NULL, NULL),
  ('century_club', 'Century Club', 'Earn 100 total exercise points', NULL, NULL),
  ('night_owl', 'Night Owl', 'Submit 5 exercises after 10pm', NULL, NULL),
  ('weekend_warrior', 'Weekend Warrior', 'Complete exercises on 5 different weekends', NULL, NULL)
ON CONFLICT (code) DO UPDATE SET
  en_name = COALESCE(EXCLUDED.en_name, award_translations_backup.en_name),
  en_description = COALESCE(EXCLUDED.en_description, award_translations_backup.en_description),
  fa_name = COALESCE(EXCLUDED.fa_name, award_translations_backup.fa_name),
  fa_description = COALESCE(EXCLUDED.fa_description, award_translations_backup.fa_description);
```

## Step 3: Drop name and description columns

```sql
-- Drop the name and description columns
DO $$
BEGIN
    -- Check if the name column exists before dropping
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.awards DROP COLUMN name;
    ELSE
        RAISE NOTICE 'Column "name" does not exist in table "awards", skipping drop operation';
    END IF;
    
    -- Check if the description column exists before dropping
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'awards' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.awards DROP COLUMN description;
    ELSE
        RAISE NOTICE 'Column "description" does not exist in table "awards", skipping drop operation';
    END IF;
END $$;
```

## Step 4: Update functions and triggers

```sql
-- Drop and recreate the achievement function
DROP FUNCTION IF EXISTS public.check_and_award_achievements(UUID) CASCADE;

-- Create the updated version of the function using code instead of name
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
  award_id_var UUID;
  award_code VARCHAR;
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

  -- Check for each award...
  -- First Submission award
  IF exercise_count >= 1 THEN
    SELECT awards.id, awards.code INTO award_id_var, award_code 
    FROM awards 
    WHERE awards.code = 'first_submission';
    
    -- Check if we found the award and award it
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
        result_message := 'Awarded: ' || award_code;
        RETURN NEXT result_message;
      END IF;
    END IF;
  END IF;

  -- Add additional award checks as needed
  
  RETURN NEXT 'Achievement check completed';
END;
$$;

-- Drop and recreate the trigger function and trigger
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;
DROP FUNCTION IF EXISTS public.trigger_check_achievements() CASCADE;

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

-- Create the trigger only if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'after_exercise_submission'
    ) THEN
        CREATE TRIGGER after_exercise_submission
        AFTER INSERT OR UPDATE ON public.exercise_submissions
        FOR EACH ROW
        EXECUTE FUNCTION public.trigger_check_achievements();
    ELSE
        -- If trigger exists but with a different function, recreate it
        DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;
        CREATE TRIGGER after_exercise_submission
        AFTER INSERT OR UPDATE ON public.exercise_submissions
        FOR EACH ROW
        EXECUTE FUNCTION public.trigger_check_achievements();
    END IF;
END $$;
```

## Step 5: Create student_achievements_view

```sql
-- Create the view for looking up student achievements with their codes
DROP VIEW IF EXISTS public.student_achievements_view;

CREATE VIEW public.student_achievements_view AS
SELECT 
  sa.id,
  sa.student_id,
  sa.award_id,
  a.code AS award_code,
  a.icon,
  a.points_value,
  a.rarity,
  a.category,
  sa.earned_at,
  sa.bonus_points
FROM 
  public.student_awards sa
JOIN 
  public.awards a ON sa.award_id = a.id;
```

## Verification

After running all the steps above, you can verify the migration was successful:

```sql
-- Check if all awards have a code
SELECT COUNT(*) as total_awards, 
       COUNT(code) as awards_with_code,
       CASE WHEN COUNT(*) = COUNT(code) THEN 'YES' ELSE 'NO' END as all_have_code
FROM public.awards;

-- Check the backup table for translations
SELECT COUNT(*) as translation_count
FROM public.award_translations_backup;

-- Check if name and description columns were removed
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'awards'
    AND column_name IN ('name', 'description')
) as columns_still_exist;

-- Check if the view was created
SELECT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'student_achievements_view'
) as view_exists;
```

If all checks pass, your migration was successful. Make sure you update your frontend code to use the new translation system instead of direct database fields.
