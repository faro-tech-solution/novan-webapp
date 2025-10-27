# RLS Policy Update Instructions

## Problem
Anonymous (non-authenticated) users cannot view instructor names on public course pages because the `profiles` table RLS policies don't allow public read access.

## Solution
Apply the new RLS policy that allows anonymous users to view trainer and admin profiles (instructors only).

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `migrations/rls/11_public_instructor_profiles.sql`
5. Click **Run** to execute the query

### Option 2: Using the CLI Script

1. Set your database URL environment variable:
   ```bash
   export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres'
   ```

2. Make the script executable:
   ```bash
   chmod +x scripts/apply-public-instructor-rls.sh
   ```

3. Run the script:
   ```bash
   ./scripts/apply-public-instructor-rls.sh
   ```

### Option 3: Using psql Directly

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f migrations/rls/11_public_instructor_profiles.sql
```

### Option 4: Using Supabase CLI

If you're using Supabase local development:

```bash
supabase db reset  # This will apply all migrations including the new one
```

Or to apply just this migration:

```bash
supabase migration new public_instructor_profiles
# Copy the contents of migrations/rls/11_public_instructor_profiles.sql to the new migration file
supabase db push
```

## What This Migration Does

Creates a new RLS policy on the `profiles` table:

```sql
CREATE POLICY "Public can view instructor profiles" ON profiles
FOR SELECT USING (
  role IN ('trainer', 'admin')
);
```

This policy:
- ✅ Allows **anonymous users** to read profiles with role `trainer` or `admin`
- ✅ Only exposes **instructor profiles** (not regular trainees)
- ✅ Works alongside existing policies (doesn't break authenticated user access)
- ⚠️ Exposes **all fields** in the profiles table for trainers/admins (but the app only selects `first_name` and `last_name`)

## Security Considerations

While this policy exposes all profile fields for trainers/admins, the application code in `src/services/courseService.ts` only selects `first_name` and `last_name`, minimizing data exposure.

If you want to further restrict access, consider:
1. Creating a database view with only public fields
2. Creating a database function that returns only specific fields
3. Using Supabase's GraphQL API with field-level permissions

## Verification

After applying the migration, verify it works:

1. **Check policy exists:**
   ```sql
   SELECT policyname, cmd, permissive 
   FROM pg_policies 
   WHERE tablename = 'profiles' 
   AND policyname = 'Public can view instructor profiles';
   ```

2. **Test anonymous access:**
   Open your browser's private/incognito mode, visit your home page, and verify instructor names are displayed on course cards.

3. **Check browser console:**
   No errors should appear related to profiles/RLS.

## Rollback

If you need to rollback this policy:

```sql
DROP POLICY IF EXISTS "Public can view instructor profiles" ON profiles;
```

## Related Files

- Migration: `migrations/rls/11_public_instructor_profiles.sql`
- Script: `scripts/apply-public-instructor-rls.sh`
- Service: `src/services/courseService.ts` (uses this policy)
- Components: 
  - `app/page.tsx` (home page)
  - `src/components/courses/PublicCourseCard.tsx`
  - `src/components/courses/PublicCourseDetail.tsx`

