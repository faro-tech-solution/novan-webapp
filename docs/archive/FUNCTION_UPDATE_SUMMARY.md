# Function and Trigger Update Summary

## Problem Identified

The original error "column 'name' does not exist" was caused by functions and migrations that were trying to access columns that no longer exist in the current database schema. Specifically:

1. **Exercise Submissions**: Functions were trying to access `student_name`, `first_name`, `last_name` columns that were removed
2. **Course Enrollments**: Migrations were adding name-related columns that shouldn't exist according to the schema
3. **Functions**: Several functions were referencing non-existent columns or using outdated logic
4. **Triggers**: Triggers were scattered across migrations and not properly organized

## Root Cause

The database schema was updated to remove name-related columns from `exercise_submissions` and `course_enrollments` tables, but the functions and some migrations were not updated to reflect these changes. The schema now uses:

- `profiles` table for user information (with `first_name`, `last_name`)
- `exercise_submissions` table without name columns (only `student_id` reference)
- `course_enrollments` table without name columns (only `student_id` reference)

## Solutions Implemented

### 1. Created Organized Function Structure

Created `/migrations/functions/` directory with organized function files:

- `00_all_functions.sql` - Master file with all functions
- `01_user_management.sql` - User registration and role functions
- `02_achievement_system.sql` - Achievement system functions
- `03_notification_system.sql` - Notification system functions
- `04_accounting_system.sql` - Financial functions
- `05_utility_functions.sql` - Utility functions

### 2. Created Organized Trigger Structure

Created `/migrations/triggers/` directory with organized trigger files:

- `00_all_triggers.sql` - Master file with all triggers
- `01_user_management_triggers.sql` - User registration triggers
- `02_achievement_triggers.sql` - Achievement system triggers
- `03_notification_triggers.sql` - Notification system triggers
- `04_accounting_triggers.sql` - Financial and payment triggers
- `05_activity_triggers.sql` - Activity logging triggers
- `06_updated_at_triggers.sql` - Timestamp management triggers

### 3. Fixed Migrations

Updated problematic migrations:

- `supabase/migrations/20250616000004-update-course-enrollments.sql` - Removed name columns and function
- `supabase/migrations/20250616000005-update-exercise-submissions.sql` - Removed name columns and function
- `supabase/migrations/20250616000012-update-course-enrollments-schema.sql` - Removed name columns and function reference

### 4. Updated Functions

All functions have been updated to:

- Remove references to non-existent name columns
- Use proper table references (e.g., `student_id` instead of name fields)
- Align with current database schema
- Use award codes instead of names for achievements

### 5. Organized Triggers

All triggers have been organized to:

- Remove references to non-existent functions
- Use consistent naming conventions
- Include proper DROP statements for clean replacement
- Align with current database schema

## Functions Updated (17 total)

**User Management (3):**
- `handle_new_user()`, `get_current_user_role()`, `is_trainer_or_admin()`

**Achievement System (2):**
- `check_and_award_achievements()`, `trigger_check_achievements()`

**Notification System (5):**
- `mark_notification_as_read()`, `create_feedback_notification()`, `create_award_notification()`, `get_latest_notifications()`, `get_unread_count()`

**Accounting System (3):**
- `get_user_balance()`, `calculate_student_balance()`, `handle_course_purchase()`

**Utility Functions (4):**
- `set_updated_at()`, `update_updated_at_column()`, `is_student_enrolled_in_course()`, `log_student_activity()`, `handle_exercise_submission_activity()`

## Triggers Organized (15 total)

**User Management (1):**
- `on_auth_user_created` - User registration

**Achievement System (1):**
- `trigger_check_achievements_after_submission` - Achievement checking

**Notification System (2):**
- `trigger_feedback_notification` - Feedback notifications
- `trigger_award_notification` - Award notifications

**Accounting System (1):**
- `trigger_course_purchase` - Course purchase accounting

**Activity Logging (1):**
- `trigger_exercise_submission_activity` - Activity logging

**Updated At Timestamps (9):**
- `set_updated_at` triggers for 9 different tables

## How to Apply the Fixes

### Option 1: Apply Everything (Recommended)
```bash
# Apply the comprehensive migration
psql -d your_database -f migrations/apply_functions_and_triggers.sql
```

### Option 2: Apply Functions and Triggers Separately
```bash
# Apply functions first
psql -d your_database -f migrations/functions/00_all_functions.sql

# Then apply triggers
psql -d your_database -f migrations/triggers/00_all_triggers.sql
```

### Option 3: Apply Individual Categories
```bash
# Apply functions by category
psql -d your_database -f migrations/functions/01_user_management.sql
psql -d your_database -f migrations/functions/02_achievement_system.sql
psql -d your_database -f migrations/functions/03_notification_system.sql
psql -d your_database -f migrations/functions/04_accounting_system.sql
psql -d your_database -f migrations/functions/05_utility_functions.sql

# Apply triggers by category
psql -d your_database -f migrations/triggers/01_user_management_triggers.sql
psql -d your_database -f migrations/triggers/02_achievement_triggers.sql
psql -d your_database -f migrations/triggers/03_notification_triggers.sql
psql -d your_database -f migrations/triggers/04_accounting_triggers.sql
psql -d your_database -f migrations/triggers/05_activity_triggers.sql
psql -d your_database -f migrations/triggers/06_updated_at_triggers.sql
```

### Option 4: Using Supabase CLI
```bash
supabase db reset
# or
supabase migration up
```

## Verification

After applying the fixes, verify that:

1. Exercise submissions work without errors
2. All functions are properly created
3. All triggers are working correctly
4. No references to non-existent columns remain
5. User registration works properly
6. Achievement system functions correctly
7. Notifications are created when expected

## Testing

Test the following scenarios:

1. **Exercise Submission**: Submit an exercise via the API endpoint
2. **User Registration**: Create a new user account
3. **Course Enrollment**: Enroll a student in a course
4. **Achievement System**: Verify achievements are awarded correctly
5. **Notifications**: Check that notifications are created properly
6. **Accounting**: Verify course purchase accounting works
7. **Timestamps**: Check that updated_at fields are updated automatically

## Rollback Plan

If issues occur, you can rollback by:

1. Restoring from a database backup
2. Reverting the migration files
3. Re-applying the original functions and triggers

## Future Maintenance

- Keep the functions and triggers directories organized by category
- Update functions and triggers when schema changes occur
- Test functions and triggers after any database schema modifications
- Maintain the `database_schema.md` documentation
- Use the organized structure for easier maintenance and debugging

## Directory Structure

```
migrations/
├── functions/
│   ├── 00_all_functions.sql
│   ├── 01_user_management.sql
│   ├── 02_achievement_system.sql
│   ├── 03_notification_system.sql
│   ├── 04_accounting_system.sql
│   ├── 05_utility_functions.sql
│   └── README.md
├── triggers/
│   ├── 00_all_triggers.sql
│   ├── 01_user_management_triggers.sql
│   ├── 02_achievement_triggers.sql
│   ├── 03_notification_triggers.sql
│   ├── 04_accounting_triggers.sql
│   ├── 05_activity_triggers.sql
│   ├── 06_updated_at_triggers.sql
│   └── README.md
├── update_all_functions.sql
└── apply_functions_and_triggers.sql
``` 