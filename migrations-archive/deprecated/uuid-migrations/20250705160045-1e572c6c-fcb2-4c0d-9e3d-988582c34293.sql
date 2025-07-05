-- Test SQL for awarding تولد یک کدنویس (Birth of a Programmer) achievement
-- This will manually run the check_and_award_achievements function for a given student ID

-- Replace 'STUDENT_ID_HERE' with an actual student ID that has at least one exercise submission
SELECT * FROM public.check_and_award_achievements('STUDENT_ID_HERE');

-- Check if the award was given
SELECT sa.id, a.name, sa.created_at, sa.bonus_points
FROM student_awards sa
JOIN awards a ON sa.award_id = a.id
WHERE sa.student_id = 'STUDENT_ID_HERE'
AND a.name = 'تولد یک کدنویس';

-- To test with a recent submission, first find a student with a recent submission:
SELECT DISTINCT student_id, MAX(submitted_at) as latest_submission
FROM exercise_submissions
GROUP BY student_id
ORDER BY latest_submission DESC
LIMIT 5;
