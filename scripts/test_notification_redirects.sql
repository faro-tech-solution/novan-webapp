-- Test Notification Redirect URLs and Translation Keys
-- ===================================================
-- This script tests that the notification functions are creating the correct redirect URLs
-- and using translation keys instead of hardcoded English text

-- Test 1: Check current notification functions
SELECT 
    'Function Check' as test_type,
    'create_feedback_notification' as function_name,
    CASE 
        WHEN pg_get_functiondef(oid) LIKE '%exercise_feedback%' 
        AND pg_get_functiondef(oid) LIKE '%/exercise/%' 
        AND pg_get_functiondef(oid) LIKE '%new_feedback_received%'
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM pg_proc 
WHERE proname = 'create_feedback_notification';

SELECT 
    'Function Check' as test_type,
    'create_award_notification' as function_name,
    CASE 
        WHEN pg_get_functiondef(oid) LIKE '%award_achieved%' 
        AND pg_get_functiondef(oid) LIKE '%/progress%' 
        AND pg_get_functiondef(oid) LIKE '%new_award_achieved:%'
        AND pg_get_functiondef(oid) LIKE '%congratulations_earned_new_award%'
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM pg_proc 
WHERE proname = 'create_award_notification';

-- Test 2: Check existing notifications for correct URLs and translation keys
SELECT 
    'Existing Notifications' as test_type,
    type,
    link,
    title,
    description,
    CASE 
        WHEN type = 'award_achieved' AND link = '/progress' THEN 'PASS - Correct URL'
        WHEN type = 'exercise_feedback' AND link LIKE '/exercise/%' THEN 'PASS - Correct URL'
        WHEN type = 'award_achieved' AND link != '/progress' THEN 'FAIL - Wrong URL'
        WHEN type = 'exercise_feedback' AND link NOT LIKE '/exercise/%' THEN 'FAIL - Wrong URL'
        WHEN title LIKE 'new_%' OR description LIKE 'new_%' OR description LIKE 'congratulations_%' THEN 'PASS - Translation Keys'
        ELSE 'INFO - Other notification type'
    END as status
FROM notifications 
WHERE type IN ('award_achieved', 'exercise_feedback')
ORDER BY created_at DESC
LIMIT 10;

-- Test 3: Check trigger existence
SELECT 
    'Trigger Check' as test_type,
    trigger_name,
    event_manipulation,
    action_statement,
    'PASS' as status
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_feedback_notification', 'trigger_award_notification')
AND event_object_table IN ('exercise_submissions', 'student_awards');

-- Test 4: Show function definitions for verification
SELECT 
    'Function Definition' as test_type,
    'create_feedback_notification' as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'create_feedback_notification';

SELECT 
    'Function Definition' as test_type,
    'create_award_notification' as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'create_award_notification'; 