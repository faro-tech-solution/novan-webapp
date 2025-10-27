# Conversation Notification Fix

## Problem
Notifications were not being created when admin or trainer responded to exercise submissions via the conversation system.

## Root Cause
1. The system migrated from using a `feedback` field to a conversation-based system (`exercise_submissions_conversation` table)
2. There was no trigger on the `exercise_submissions_conversation` table to create notifications
3. The notification functions were using the old `link` column which was removed from the notifications table

## Solution

### Database Schema Changes
The `notifications` table was updated to:
- Remove the `link` column
- Store link information in the `metadata` JSONB field instead

### New Function Created
**`create_conversation_notification()`**: Creates a notification when trainer/admin sends a message in exercise conversations
- Only triggers for trainer/admin messages (not student messages)
- Retrieves student_id and exercise_id from the submission
- Creates notification with type 'exercise_feedback'
- Stores link in metadata as `/exercise/{exercise_id}`

### Trigger Created
**`trigger_conversation_notification`**: Fires after INSERT on `exercise_submissions_conversation` table

### Updated Functions
All notification creation functions were updated to:
1. Remove `link` from INSERT column list
2. Add link information to `metadata` JSONB field instead

Updated functions:
- `create_feedback_notification()` - For direct feedback updates
- `create_award_notification()` - For award achievements
- `create_conversation_notification()` - For conversation messages

### Files Modified
1. `migrations/add_conversation_notification_trigger.sql` - Main migration file
2. `migrations/functions/00_all_functions.sql` - Comprehensive functions file
3. `migrations/functions/03_notification_system.sql` - Notification functions file
4. `migrations/triggers/00_all_triggers.sql` - Comprehensive triggers file
5. `migrations/triggers/04_conversation_notification_trigger.sql` - New trigger file
6. `migrations/update_all_functions.sql` - Function update migration
7. `migrations/update_notification_redirects.sql` - Redirect update migration
8. `scripts/apply_conversation_notification_trigger.sh` - Application script

## How to Apply

### Option 1: Using the Script
```bash
cd /Users/hamidtadayoni/Documents/PROJECTS/personal/novan-webapp
./scripts/apply_conversation_notification_trigger.sh
```

### Option 2: Manual Application
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/add_conversation_notification_trigger.sql`
4. Execute the SQL

### Option 3: Using Supabase CLI
```bash
supabase db execute --file migrations/add_conversation_notification_trigger.sql
```

## Testing
After applying the migration:
1. Login as admin or trainer
2. Go to "Review Submissions" page
3. Open a student's exercise submission
4. Send a message in the conversation
5. Login as the student
6. Check notifications - you should see a new notification

## Verification
To verify the trigger is installed:
```sql
SELECT 
    tgname as trigger_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_conversation_notification';
```

Expected result:
- trigger_name: `trigger_conversation_notification`
- function_name: `create_conversation_notification`

## Rollback
If you need to rollback:
```sql
DROP TRIGGER IF EXISTS trigger_conversation_notification ON exercise_submissions_conversation;
DROP FUNCTION IF EXISTS create_conversation_notification();
```

## Notes
- The notification is only created for trainer/admin messages, not student messages
- The link is stored in `metadata.link` for frontend compatibility
- This maintains backward compatibility with existing notification handling code

