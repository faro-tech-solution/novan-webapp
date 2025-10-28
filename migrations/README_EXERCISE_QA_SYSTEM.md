# Exercise Q&A System Migration Guide

## Overview

This guide explains how to apply the Exercise Q&A System migration to your database. The Q&A system enables threaded discussions on exercises with voting, bookmarking, and notification features.

## System Architecture

### Database Tables
1. **exercise_qa** - Main table for questions, answers, and replies
2. **exercise_qa_vote** - Tracks user votes (upvote/downvote)
3. **exercise_qa_bookmark** - Manages user bookmarks

### Access Control
- **Students**: View and interact with Q&A in enrolled courses only
- **Instructors**: Access Q&A in their assigned courses
- **Admins**: Full access to all Q&A across all courses

### Features
- **Threaded Discussions**: Questions with nested replies
- **Voting System**: Upvote/downvote with automatic count calculation
- **Bookmarking**: Save important Q&A posts
- **Notifications**: Automatic notifications for new questions and replies
- **Role-based Access**: RLS policies ensure proper permissions

## Migration Files

### 1. Main Q&A Table
- **File**: `migrations/add_exercise_qa_table.sql`
- **Purpose**: Creates exercise_qa table with indexes and enables RLS
- **Order**: Apply first

### 2. Vote Table
- **File**: `migrations/add_exercise_qa_vote_table.sql`
- **Purpose**: Creates exercise_qa_vote table with indexes and enables RLS
- **Order**: Apply second (depends on exercise_qa)

### 3. Bookmark Table
- **File**: `migrations/add_exercise_qa_bookmark_table.sql`
- **Purpose**: Creates exercise_qa_bookmark table with indexes and enables RLS
- **Order**: Apply third (depends on exercise_qa)

### 4. RLS Policies
- **File**: `migrations/rls/11_exercise_qa_rls.sql`
- **Purpose**: Creates 20 RLS policies for complete access control
- **Order**: Apply after main migration

### 5. Functions
- **File**: `migrations/functions/06_exercise_qa_functions.sql`
- **Purpose**: Creates 3 functions for vote counting and notifications
- **Order**: Apply before triggers

### 6. Triggers
- **File**: `migrations/triggers/07_exercise_qa_triggers.sql`
- **Purpose**: Creates 4 triggers for automation
- **Order**: Apply last

## How to Apply

### Option 1: Manual Application (Recommended for Testing)

Apply each file in order:

```sql
-- Step 1: Create exercise_qa table
\i migrations/add_exercise_qa_table.sql

-- Step 2: Create exercise_qa_vote table
\i migrations/add_exercise_qa_vote_table.sql

-- Step 3: Create exercise_qa_bookmark table
\i migrations/add_exercise_qa_bookmark_table.sql

-- Step 4: Apply RLS policies
\i migrations/rls/11_exercise_qa_rls.sql

-- Step 5: Create functions
\i migrations/functions/06_exercise_qa_functions.sql

-- Step 6: Create triggers
\i migrations/triggers/07_exercise_qa_triggers.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each file in order:
   - `add_exercise_qa_table.sql`
   - `add_exercise_qa_vote_table.sql`
   - `add_exercise_qa_bookmark_table.sql`
   - `rls/11_exercise_qa_rls.sql`
   - `functions/06_exercise_qa_functions.sql`
   - `triggers/07_exercise_qa_triggers.sql`
4. Execute each file

### Option 3: Using Supabase CLI

```bash
# Apply table migrations
supabase db execute --file migrations/add_exercise_qa_table.sql
supabase db execute --file migrations/add_exercise_qa_vote_table.sql
supabase db execute --file migrations/add_exercise_qa_bookmark_table.sql

# Apply RLS policies
supabase db execute --file migrations/rls/11_exercise_qa_rls.sql

# Apply functions
supabase db execute --file migrations/functions/06_exercise_qa_functions.sql

# Apply triggers
supabase db execute --file migrations/triggers/07_exercise_qa_triggers.sql
```

### Option 4: All-in-One Script

Create a script file `apply_exercise_qa_migration.sh`:

```bash
#!/bin/bash

# Apply Exercise Q&A System Migration
# ====================================

echo "Starting Exercise Q&A System migration..."

echo "Step 1/6: Creating exercise_qa table..."
psql "$DATABASE_URL" -f migrations/add_exercise_qa_table.sql

echo "Step 2/6: Creating exercise_qa_vote table..."
psql "$DATABASE_URL" -f migrations/add_exercise_qa_vote_table.sql

echo "Step 3/6: Creating exercise_qa_bookmark table..."
psql "$DATABASE_URL" -f migrations/add_exercise_qa_bookmark_table.sql

echo "Step 4/6: Applying RLS policies..."
psql "$DATABASE_URL" -f migrations/rls/11_exercise_qa_rls.sql

echo "Step 5/6: Creating functions..."
psql "$DATABASE_URL" -f migrations/functions/06_exercise_qa_functions.sql

echo "Step 6/6: Creating triggers..."
psql "$DATABASE_URL" -f migrations/triggers/07_exercise_qa_triggers.sql

echo "✅ Exercise Q&A System migration completed successfully!"
```

Make it executable and run:

```bash
chmod +x apply_exercise_qa_migration.sh
./apply_exercise_qa_migration.sh
```

## Verification

After applying the migration, verify the installation:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('exercise_qa', 'exercise_qa_vote', 'exercise_qa_bookmark');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('exercise_qa', 'exercise_qa_vote', 'exercise_qa_bookmark');

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('exercise_qa', 'exercise_qa_vote', 'exercise_qa_bookmark')
ORDER BY tablename, policyname;

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'update_qa_vote_count',
  'notify_trainer_new_question',
  'notify_answer_to_question'
);

-- Check triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%qa%'
ORDER BY event_object_table, trigger_name;
```

## Expected Results

After successful migration:

### Tables
- ✅ 3 tables created
- ✅ 13 indexes created for performance
- ✅ RLS enabled on all tables

### RLS Policies
- ✅ exercise_qa: 9 policies
- ✅ exercise_qa_vote: 6 policies
- ✅ exercise_qa_bookmark: 5 policies
- ✅ Total: 20 policies

### Functions
- ✅ update_qa_vote_count()
- ✅ notify_trainer_new_question()
- ✅ notify_answer_to_question()

### Triggers
- ✅ trigger_update_qa_vote_count
- ✅ set_updated_at_qa
- ✅ trigger_notify_trainer_new_question
- ✅ trigger_notify_answer_to_question

## Testing

### Test 1: Create a Question

```sql
-- As a student enrolled in a course
INSERT INTO exercise_qa (title, description, exercise_id, user_id)
VALUES (
  'How do I solve this problem?',
  'I am stuck on step 3...',
  '<exercise_id>',
  auth.uid()
);

-- Check if notification was sent to instructor
SELECT * FROM notifications 
WHERE title = 'new_question_in_exercise' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test 2: Reply to Question

```sql
-- As instructor or another student
INSERT INTO exercise_qa (description, exercise_id, user_id, parent_id)
VALUES (
  'Try checking the documentation...',
  '<exercise_id>',
  auth.uid(),
  '<parent_qa_id>'
);

-- Check if notification was sent to question author
SELECT * FROM notifications 
WHERE title = 'new_reply_to_your_post' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test 3: Vote on Q&A

```sql
-- Upvote a question
INSERT INTO exercise_qa_vote (exercise_qa_id, user_id, vote_type)
VALUES ('<qa_id>', auth.uid(), 1);

-- Check if vote_count was updated
SELECT id, vote_count FROM exercise_qa WHERE id = '<qa_id>';
```

### Test 4: Bookmark Q&A

```sql
-- Bookmark a question
INSERT INTO exercise_qa_bookmark (qa_id, user_id)
VALUES ('<qa_id>', auth.uid());

-- Check bookmark exists
SELECT * FROM exercise_qa_bookmark WHERE qa_id = '<qa_id>' AND user_id = auth.uid();
```

## Troubleshooting

### Issue 1: RLS Prevents Access

**Problem**: Users cannot view Q&A posts

**Solution**:
- Verify user is enrolled in the course (for students)
- Verify user is the course instructor (for instructors)
- Check user role in profiles table

```sql
-- Check enrollment
SELECT * FROM course_enrollments 
WHERE student_id = auth.uid() 
  AND course_id = (SELECT course_id FROM exercises WHERE id = '<exercise_id>');

-- Check instructor
SELECT * FROM courses 
WHERE id = (SELECT course_id FROM exercises WHERE id = '<exercise_id>')
  AND instructor_id = auth.uid();
```

### Issue 2: Votes Not Counting

**Problem**: vote_count not updating

**Solution**:
- Verify trigger is active
- Check trigger function exists

```sql
-- Check trigger
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_qa_vote_count';

-- Manually recalculate vote count
UPDATE exercise_qa 
SET vote_count = (
  SELECT COALESCE(SUM(vote_type), 0) 
  FROM exercise_qa_vote 
  WHERE exercise_qa_id = exercise_qa.id
);
```

### Issue 3: No Notifications

**Problem**: Notifications not being created

**Solution**:
- Verify triggers are active
- Check that sender and receiver are different users
- Verify course has instructor assigned

```sql
-- Check triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%qa%';

-- Check course instructor
SELECT instructor_id FROM courses 
WHERE id = (SELECT course_id FROM exercises WHERE id = '<exercise_id>');
```

## Rollback

If you need to rollback the migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_qa_vote_count ON exercise_qa_vote;
DROP TRIGGER IF EXISTS set_updated_at_qa ON exercise_qa;
DROP TRIGGER IF EXISTS trigger_notify_trainer_new_question ON exercise_qa;
DROP TRIGGER IF EXISTS trigger_notify_answer_to_question ON exercise_qa;

-- Drop functions
DROP FUNCTION IF EXISTS update_qa_vote_count();
DROP FUNCTION IF EXISTS notify_trainer_new_question();
DROP FUNCTION IF EXISTS notify_answer_to_question();

-- Drop tables (WARNING: This will delete all Q&A data)
DROP TABLE IF EXISTS exercise_qa_bookmark CASCADE;
DROP TABLE IF EXISTS exercise_qa_vote CASCADE;
DROP TABLE IF EXISTS exercise_qa CASCADE;
```

## Next Steps

After successful migration:

1. **Create TypeScript Types**: See `exercise-qa-system-plan-en.md` for type definitions
2. **Create Services**: Implement CRUD operations in `src/services/qaService.ts`
3. **Create Hooks**: Implement React Query hooks in `src/hooks/useExerciseQA.ts`
4. **Create UI Components**: Build Q&A components in `src/components/qa/`
5. **Integrate**: Add Q&A section to exercise pages

## Support

For issues or questions:
1. Check `docs/archive/EXERCISE_QA_SYSTEM.md` for feature documentation
2. Review `exercise-qa-system-plan-en.md` for detailed implementation plan
3. Check RLS policies if access issues occur
4. Verify triggers are active if automation fails

---

**Migration Version**: 1.0.0  
**Date**: 2024-10-18  
**Compatibility**: PostgreSQL 14+ with Supabase
