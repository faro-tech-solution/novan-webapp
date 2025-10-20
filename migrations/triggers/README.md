# Database Triggers

This directory contains all database triggers organized by category. These triggers are designed to work with the current database schema and the functions defined in `/migrations/functions/`.

## Directory Structure

- `00_all_triggers.sql` - Master file containing all triggers (use this to apply all triggers)
- `01_user_management_triggers.sql` - User registration triggers
- `02_achievement_triggers.sql` - Achievement system triggers
- `03_notification_triggers.sql` - Notification system triggers
- `04_accounting_triggers.sql` - Financial and payment triggers
- `05_activity_triggers.sql` - Activity logging triggers
- `06_updated_at_triggers.sql` - Timestamp management triggers
- `07_exercise_qa_triggers.sql` - Exercise Q&A system triggers

## Trigger Categories

### User Management Triggers
- `on_auth_user_created` - Automatically creates profile when user signs up

### Achievement System Triggers
- `trigger_check_achievements_after_submission` - Checks and awards achievements after exercise submission

### Notification System Triggers
- `trigger_feedback_notification` - Creates notifications when exercise feedback is updated
- `trigger_award_notification` - Creates notifications when awards are achieved

### Accounting System Triggers
- `trigger_course_purchase` - Handles accounting when courses are purchased

### Activity Logging Triggers
- `trigger_exercise_submission_activity` - Logs activity when exercises are submitted

### Updated At Timestamp Triggers
- `set_updated_at` - Updates `updated_at` timestamp on various tables:
  - profiles
  - courses
  - exercises
  - course_terms
  - groups
  - wiki_categories
  - wiki_topics
  - wiki_articles
  - course_enrollments
  - accounting

### Exercise Q&A System Triggers
- `trigger_update_qa_vote_count` - Automatically updates vote counts when votes change
- `set_updated_at_qa` - Updates timestamp when Q&A posts are modified
- `trigger_notify_trainer_new_question` - Sends notification to instructor for new questions
- `trigger_notify_answer_to_question` - Sends notification to parent author for new replies

## Usage

### Apply All Triggers
To apply all triggers to your database:

```sql
\i migrations/triggers/00_all_triggers.sql
```

### Apply Individual Categories
To apply triggers by category:

```sql
\i migrations/triggers/01_user_management_triggers.sql
\i migrations/triggers/02_achievement_triggers.sql
\i migrations/triggers/03_notification_triggers.sql
\i migrations/triggers/04_accounting_triggers.sql
\i migrations/triggers/05_activity_triggers.sql
\i migrations/triggers/06_updated_at_triggers.sql
\i migrations/triggers/07_exercise_qa_triggers.sql
```

### Using Supabase CLI
```bash
# Apply the triggers
psql -d your_database -f migrations/triggers/00_all_triggers.sql
```

## Important Notes

1. **Function Dependencies**: All triggers depend on functions defined in `/migrations/functions/`. Make sure to apply functions before triggers.

2. **Clean Drops**: All triggers include `DROP TRIGGER IF EXISTS` statements to ensure clean replacement.

3. **Schema Compatibility**: All triggers are designed to work with the current database schema as documented in `database_schema.md`.

4. **Trigger Order**: Some triggers may have dependencies. The master file applies them in the correct order.

## Trigger Details

### User Registration Trigger
- **Table**: `auth.users`
- **Event**: `AFTER INSERT`
- **Function**: `public.handle_new_user()`
- **Purpose**: Automatically creates a profile record when a new user signs up

### Achievement Trigger
- **Table**: `exercise_submissions`
- **Event**: `AFTER INSERT`
- **Function**: `public.trigger_check_achievements()`
- **Purpose**: Checks for achievement criteria and awards achievements

### Feedback Notification Trigger
- **Table**: `exercise_submissions`
- **Event**: `AFTER UPDATE`
- **Function**: `create_feedback_notification()`
- **Purpose**: Creates notifications when feedback is provided

### Award Notification Trigger
- **Table**: `student_awards`
- **Event**: `AFTER INSERT`
- **Function**: `create_award_notification()`
- **Purpose**: Creates notifications when awards are achieved

### Course Purchase Trigger
- **Table**: `course_enrollments`
- **Event**: `AFTER INSERT`
- **Function**: `handle_course_purchase()`
- **Purpose**: Handles accounting for course purchases

### Activity Logging Trigger
- **Table**: `exercise_submissions`
- **Event**: `AFTER INSERT`
- **Function**: `handle_exercise_submission_activity()`
- **Purpose**: Logs student activity for tracking

### Updated At Triggers
- **Tables**: Various tables with `updated_at` columns
- **Event**: `BEFORE UPDATE`
- **Function**: `set_updated_at()`
- **Purpose**: Automatically updates timestamp when records are modified

### Exercise Q&A Vote Count Trigger
- **Table**: `exercise_qa_vote`
- **Event**: `AFTER INSERT OR UPDATE OR DELETE`
- **Function**: `update_qa_vote_count()`
- **Purpose**: Automatically calculates and updates vote counts

### Exercise Q&A Timestamp Trigger
- **Table**: `exercise_qa`
- **Event**: `BEFORE UPDATE`
- **Function**: `update_updated_at_column()`
- **Purpose**: Updates timestamp when Q&A posts are modified

### Exercise Q&A Question Notification Trigger
- **Table**: `exercise_qa`
- **Event**: `AFTER INSERT`
- **Function**: `notify_trainer_new_question()`
- **Purpose**: Sends notification to instructor when new questions are posted

### Exercise Q&A Reply Notification Trigger
- **Table**: `exercise_qa`
- **Event**: `AFTER INSERT`
- **Function**: `notify_answer_to_question()`
- **Purpose**: Sends notification to parent author when someone replies

## Troubleshooting

If you encounter errors when applying triggers:

1. Ensure all required functions are created first
2. Check that all referenced tables exist
3. Verify that the database schema matches expectations
4. Check for any conflicting trigger names

## Recent Changes

- Added Exercise Q&A system triggers for voting, notifications, and timestamp management
- Organized triggers by functional category
- Added comprehensive DROP statements for clean replacement
- Aligned all triggers with current database schema
- Removed deprecated triggers that referenced non-existent columns
- Standardized trigger naming conventions 