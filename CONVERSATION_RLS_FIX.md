# Exercise Submissions Conversation RLS Policy Fix

## Issue Description

After implementing the new conversation-based submission process, exercise submissions were failing with this RLS (Row Level Security) error:

```
code: "42501"
details: null
hint: null
message: "new row violates row-level security policy for table \"exercise_submissions_conversation\""
```

## Root Cause

The `exercise_submissions_conversation` table was created but **no RLS policies were defined for it**. When RLS is enabled on a table (which happens by default in many Supabase setups), all operations are denied unless specific policies allow them.

## Solution

Created comprehensive RLS policies for the `exercise_submissions_conversation` table that allow:

### Admin Policies
- **Full Access**: Admins can view, create, update, and delete all conversation messages

### Trainer Policies  
- **View Messages**: Trainers can view conversation messages for exercises they created
- **Create Messages**: Trainers can create conversation messages for their exercises

### Trainee Policies
- **View Messages**: Trainees can view conversation messages for their own submissions
- **Create Messages**: Trainees can create conversation messages for their own submissions

### General Policies
- **Authenticated Access**: Authenticated users can view messages with proper access control based on their relationship to the submission

## Files Created

1. **`migrations/rls/06_exercise_submissions_conversation_rls.sql`** - Comprehensive RLS policies
2. **`supabase/migrations/20250101000002_add_conversation_rls_policies.sql`** - Supabase migration file
3. **`scripts/apply_conversation_rls_policies.sh`** - Script to apply the policies

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
```bash
supabase db push --linked
```

### Option 2: Using the Script
```bash
./scripts/apply_conversation_rls_policies.sh
```

### Option 3: Manual SQL Execution
Execute the SQL file directly in your database:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20250101000002_add_conversation_rls_policies.sql
```

## Security Considerations

The policies ensure that:

1. **Data Isolation**: Users can only access conversation messages for submissions they're involved with
2. **Role-Based Access**: Different access levels for admins, trainers, and trainees  
3. **Ownership Validation**: Messages can only be created by authenticated users for their relevant submissions
4. **Comprehensive Coverage**: All CRUD operations are properly secured

## Testing

After applying the migration, test:

1. **Trainee submission with feedback** (should create conversation entry)
2. **Trainer replying to submission** (should create conversation message)
3. **Admin viewing all conversations** (should have full access)
4. **Cross-user access attempts** (should be properly blocked)

## Database Schema Impact

The `exercise_submissions_conversation` table now has proper RLS policies that align with the existing access control patterns used throughout the application, ensuring consistent security across all exercise-related operations.
