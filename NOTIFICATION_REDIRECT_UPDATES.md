# Notification Redirect URL and Translation Key Updates

## Overview

This document describes the updates made to notification redirect URLs and the implementation of translation keys to ensure notifications are properly localized and point to the correct pages in the application.

## Changes Made

### 1. Award Achievement Notifications
- **Previous URL**: `/profile/awards`
- **New URL**: `/progress`
- **Previous Title**: `'New Award Achieved: ' + award_code`
- **New Title**: `'new_award_achieved: ' + award_code`
- **Previous Description**: `'Congratulations! You have earned a new award.'`
- **New Description**: `'congratulations_earned_new_award'`
- **Reason**: Awards are now displayed on the progress page and titles/descriptions use translation keys

### 2. Exercise Feedback Notifications
- **Previous URL**: `/exercises/{exercise_id}`
- **New URL**: `/exercise/{exercise_id}`
- **Previous Title**: `'New Feedback Received'`
- **New Title**: `'new_feedback_received'`
- **Reason**: The exercise detail page uses singular `/exercise/` route and titles use translation keys

## Files Updated

### Database Functions
- `migrations/functions/03_notification_system.sql`
- `migrations/functions/00_all_functions.sql`
- `migrations/update_all_functions.sql`

### Migration Files
- `migrations/update_notification_redirects.sql` (updated)

### Scripts
- `scripts/apply_notification_redirects.sh` (updated)
- `scripts/test_notification_redirects.sql` (updated)

### Frontend Files
- `src/translations/notificationTranslations.ts` (new)
- `src/utils/notificationTranslationUtils.ts` (new)
- `src/pages/notifications.tsx` (updated)
- `src/components/layout/NotificationBell.tsx` (updated)

## Functions Modified

### `create_award_notification()`
```sql
-- Before
'title' => 'New Award Achieved: ' || (SELECT code FROM awards WHERE id = NEW.award_id),
'description' => 'Congratulations! You have earned a new award.',
'link' => '/profile/awards'

-- After  
'title' => 'new_award_achieved: ' || (SELECT code FROM awards WHERE id = NEW.award_id),
'description' => 'congratulations_earned_new_award',
'link' => '/progress'
```

### `create_feedback_notification()`
```sql
-- Before
'title' => 'New Feedback Received',
'link' => '/exercises/' || NEW.exercise_id

-- After
'title' => 'new_feedback_received',
'link' => '/exercise/' || NEW.exercise_id
```

## Translation System

### Translation Keys
- `new_feedback_received` - For exercise feedback notifications
- `new_award_achieved: {award_code}` - For award achievement notifications
- `congratulations_earned_new_award` - For award achievement descriptions

### Translation Files
- `src/translations/notificationTranslations.ts` - Contains all notification translations
- `src/utils/notificationTranslationUtils.ts` - Utility functions for translation

### Supported Languages
- **English (en)**: Default language
- **Persian (fa)**: RTL language support

## How to Apply

### Option 1: Using the Script (Recommended)
```bash
./scripts/apply_notification_redirects.sh
```

### Option 2: Manual Application
```bash
psql "$DATABASE_URL" -f migrations/update_notification_redirects.sql
```

## Testing

### Run the Test Script
```bash
psql "$DATABASE_URL" -f scripts/test_notification_redirects.sql
```

### Manual Testing
1. **Award Notifications**: 
   - Trigger an award achievement
   - Click the notification
   - Verify it redirects to `/progress`
   - Verify the title and description are translated

2. **Feedback Notifications**:
   - Update exercise feedback for a student
   - Click the notification
   - Verify it redirects to `/exercise/{exercise_id}`
   - Verify the title is translated

## Verification Steps

1. **Check Function Definitions**:
   ```sql
   SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'create_award_notification';
   SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'create_feedback_notification';
   ```

2. **Check Existing Notifications**:
   ```sql
   SELECT type, link, title, description FROM notifications 
   WHERE type IN ('award_achieved', 'exercise_feedback')
   ORDER BY created_at DESC;
   ```

3. **Verify Triggers**:
   ```sql
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name IN ('trigger_feedback_notification', 'trigger_award_notification');
   ```

4. **Test Frontend Translations**:
   - Switch language in the app
   - Check that notification titles and descriptions are properly translated

## Impact

### Existing Notifications
- **Existing notifications will retain their old URLs and text**
- **Only new notifications will use the updated URLs and translation keys**
- **No data migration is required for existing notifications**

### New Notifications
- **Award achievements**: Will redirect to `/progress` with translation keys
- **Exercise feedback**: Will redirect to `/exercise/{exercise_id}` with translation keys

### Frontend Changes
- **Notification components now use translation utilities**
- **Support for multiple languages**
- **Fallback to English if translation is missing**

## Rollback

If you need to rollback these changes:

```sql
-- Revert to old URLs and text
UPDATE notifications 
SET link = '/profile/awards',
    title = REPLACE(title, 'new_award_achieved: ', 'New Award Achieved: '),
    description = 'Congratulations! You have earned a new award.'
WHERE type = 'award_achieved' AND link = '/progress';

UPDATE notifications 
SET link = REPLACE(link, '/exercise/', '/exercises/'),
    title = 'New Feedback Received'
WHERE type = 'exercise_feedback' AND link LIKE '/exercise/%';
```

Then reapply the old function definitions.

## Notes

- The changes affect both the `link` field and the `title`/`description` fields in notifications
- All notification functionality remains unchanged
- Triggers are automatically recreated during the migration
- No downtime is required for this update
- Frontend components automatically handle translation fallbacks 