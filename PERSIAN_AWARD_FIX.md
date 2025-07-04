# Achievement System Persian Award Fix

## Problem

The achievement "تولد یک کدنویس" (Birth of a Programmer) was not being awarded after the first exercise submission because the award system function was looking for the English name "First Submission" rather than the Persian name.

## Root Cause Analysis

1. The awards table had been updated to use Persian names instead of English names (via migration file `20250615131858-f11c9d58-00a9-40c4-95c4-c85ccac1f9b8.sql`)
2. The award function (`check_and_award_achievements`) was still looking for English names like "First Submission"
3. This mismatch caused the award to not be found when a student submitted their first exercise

## Solution

1. Updated the `achievement_system.sql` file to look for both Persian and English award names:

   ```sql
   WHERE awards.name = 'تولد یک کدنویس' OR awards.name = 'First Submission'
   ```

2. Added similar dual-name checks for other awards:

   - استاد کامل / Perfect Score
   - نابغه برنامه‌نویسی / High Achiever
   - تکمیل‌کننده زودهنگام / Early Bird

3. Created additional diagnostic and test scripts:

   - `check_persian_awards.sql`: To verify Persian award names exist
   - `test_persian_achievement.sql`: To manually test achievement awarding

4. Created a dedicated script to apply the Persian award fix:
   - `scripts/update_achievement_system_persian.sh`

## How to Test

1. Run the Persian award update script:

   ```
   ./scripts/update_achievement_system_persian.sh
   ```

2. Find a student who has not received the "تولد یک کدنویس" award yet
3. Have them submit their first exercise
4. Check if they receive the award automatically

Or test manually with:

```sql
SELECT * FROM public.check_and_award_achievements('STUDENT_ID_HERE');
```

## Results

The achievement system now checks for both Persian and English award names, so students will receive the "تولد یک کدنویس" award after submitting their first exercise.
