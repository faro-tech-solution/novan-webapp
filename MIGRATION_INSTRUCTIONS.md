# Exercise Categories Migration Instructions

## Overview

The exercise categories feature requires a database migration to be applied before it can be used. This document provides step-by-step instructions for applying the migration.

## Prerequisites

1. **Supabase CLI** (recommended) or direct database access
2. **Database credentials** for your Supabase project
3. **Project ID**: `dynmgviifqrozsczabvz`

## Method 1: Using Supabase CLI (Recommended)

### Step 1: Install Supabase CLI

```bash
# macOS (using Homebrew)
brew install supabase/tap/supabase

# Or download from: https://supabase.com/docs/guides/cli
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link your project

```bash
supabase link --project-ref dynmgviifqrozsczabvz
```

### Step 4: Apply the migration

```bash
# Apply the migration directly
supabase db push --include-all

# Or run the specific migration file
supabase db push --file migrations/exercise_categories.sql
```

## Method 2: Using Supabase Dashboard

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `dynmgviifqrozsczabvz`

### Step 2: Open SQL Editor

1. Navigate to **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Run the Migration

1. Copy the contents of `migrations/exercise_categories.sql`
2. Paste it into the SQL editor
3. Click **Run** to execute the migration

## Method 3: Using psql (Direct Database Access)

### Step 1: Get Database Connection Details

1. Go to Supabase Dashboard → Settings → Database
2. Copy the connection string or individual credentials

### Step 2: Connect and Run Migration

```bash
# Set environment variables
export DATABASE_URL="your-connection-string"

# Run the migration
psql "$DATABASE_URL" -f migrations/exercise_categories.sql
```

## Verification

After applying the migration, verify it was successful:

### Option 1: Run the test script

```bash
psql "$DATABASE_URL" -f scripts/test_exercise_categories.sql
```

### Option 2: Check manually in Supabase Dashboard

1. Go to **Table Editor**
2. Look for the `exercise_categories` table
3. Check that the `category_id` column was added to the `exercises` table

### Option 3: Check via SQL

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'exercise_categories';

-- Check if column was added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'exercises' AND column_name = 'category_id';
```

## Post-Migration Steps

### Step 1: Update TypeScript Types

After the migration is applied, you need to regenerate the TypeScript types:

```bash
# If using Supabase CLI
supabase gen types typescript --project-id dynmgviifqrozsczabvz > src/types/database.types.ts

# Or manually update the types to include exercise_categories
```

### Step 2: Enable the Feature

1. Uncomment the code in `src/services/exerciseCategoryService.ts`
2. Remove the temporary error messages
3. Test the feature in the application

### Step 3: Test the Feature

1. Start the development server: `npm run dev`
2. Go to Course Management
3. Click on a course's three dots menu
4. Select "دسته‌بندی تمرینات" (Exercise Categories)
5. Try creating a category

## Troubleshooting

### Error: "relation does not exist"

**Cause**: Migration not applied
**Solution**: Apply the migration using one of the methods above

### Error: "permission denied"

**Cause**: Insufficient database permissions
**Solution**: 
1. Check your database role permissions
2. Ensure you're using the correct connection string
3. Contact your database administrator

### Error: "duplicate key value"

**Cause**: Migration already applied
**Solution**: This is normal - the migration uses `IF NOT EXISTS` clauses

### Error: "foreign key constraint"

**Cause**: Missing referenced table
**Solution**: Ensure the `courses` table exists before applying the migration

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop the exercise_categories table
DROP TABLE IF EXISTS exercise_categories CASCADE;

-- Remove the category_id column from exercises
ALTER TABLE exercises DROP COLUMN IF EXISTS category_id;

-- Drop related indexes
DROP INDEX IF EXISTS idx_exercise_categories_course_id;
DROP INDEX IF EXISTS idx_exercise_categories_order;
DROP INDEX IF EXISTS idx_exercises_category_id;
```

## Support

If you encounter issues:

1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Ensure you have the correct permissions
4. Check the migration file syntax

## Next Steps

Once the migration is successfully applied:

1. ✅ The exercise categories feature will be fully functional
2. ✅ You can create, edit, and delete categories
3. ✅ Exercises can be assigned to categories
4. ✅ The UI will show organized exercises by category

The feature is designed to be backward compatible, so existing exercises will continue to work normally even without categories assigned. 