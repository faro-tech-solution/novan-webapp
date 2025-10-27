# Database Functions

This directory contains all database functions organized by category. These functions are designed to work with the current database schema as documented in `database_schema.md`.

## Directory Structure

- `00_all_functions.sql` - Master file containing all functions (use this to apply all functions)
- `01_user_management.sql` - User registration and role management functions
- `02_achievement_system.sql` - Achievement and award system functions
- `03_notification_system.sql` - Notification creation and management functions
- `04_accounting_system.sql` - Financial and balance calculation functions
- `05_utility_functions.sql` - General utility and helper functions

## Function Categories

### User Management Functions
- `handle_new_user()` - Handles new user registration and profile creation
- `get_current_user_role()` - Returns the current user's role
- `is_trainer_or_admin()` - Checks if user has trainer or admin privileges

### Achievement System Functions
- `check_and_award_achievements(student_id_param UUID)` - Checks and awards achievements based on student activity
- `trigger_check_achievements()` - Trigger function for automatic achievement checking

### Notification System Functions
- `mark_notification_as_read(notification_uuid UUID)` - Marks a notification as read
- `create_feedback_notification()` - Creates notifications for exercise feedback
- `create_award_notification()` - Creates notifications for award achievements
- `get_latest_notifications(p_user_id UUID, p_limit INTEGER)` - Retrieves latest notifications
- `get_unread_count(p_user_id UUID)` - Returns count of unread notifications

### Accounting System Functions
- `get_user_balance(user_id UUID)` - Returns user's current balance
- `calculate_student_balance(p_user_id UUID)` - Calculates student's total balance
- `handle_course_purchase()` - Handles course purchase accounting

### Utility Functions
- `set_updated_at()` - Sets updated_at timestamp on record changes
- `update_updated_at_column()` - Alias for set_updated_at
- `is_student_enrolled_in_course(course_id uuid, student_id uuid)` - Checks enrollment status
- `log_student_activity(p_student_id UUID, p_activity_type TEXT, ...)` - Logs student activities
- `handle_exercise_submission_activity()` - Handles exercise submission logging

## Usage

### Apply All Functions
To apply all functions to your database:

```sql
\i migrations/functions/00_all_functions.sql
```

### Apply Individual Categories
To apply functions by category:

```sql
\i migrations/functions/01_user_management.sql
\i migrations/functions/02_achievement_system.sql
-- etc.
```

## Important Notes

1. **Schema Compatibility**: All functions are designed to work with the current database schema as documented in `database_schema.md`.

2. **Security**: Functions use `SECURITY DEFINER` where appropriate to ensure proper permissions.

3. **Triggers**: Some functions are designed to be used as triggers. Make sure to set up the appropriate triggers after applying the functions.

4. **Dependencies**: Functions may depend on specific table structures. Ensure all tables are created before applying functions.

## Recent Changes

- Removed name-related column references from functions
- Updated achievement system to use award codes instead of names
- Aligned all functions with current database schema
- Removed deprecated functions that referenced non-existent columns

## Troubleshooting

If you encounter errors when applying functions:

1. Check that all required tables exist
2. Verify that the database schema matches `database_schema.md`
3. Ensure all required extensions are installed (e.g., `uuid-ossp`)
4. Check that RLS policies are properly configured 