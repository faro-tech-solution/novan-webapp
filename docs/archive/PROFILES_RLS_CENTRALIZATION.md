# Profiles RLS Policies Centralization

## Overview

All profiles-related RLS policies have been centralized into `migrations/rls/01_profiles_rls.sql` to ensure consistency and avoid duplication across multiple files.

## Changes Made

### 1. Removed Profiles Policies from Dashboard Files

#### `migrations/rls/04_dashboard_rls_policies.sql`
- ❌ **Removed**: All profiles RLS policies (12 policies)
- ✅ **Added**: Note referencing `01_profiles_rls.sql`
- ✅ **Kept**: All other dashboard table policies

#### `migrations/rls/06_dashboard_rls_policies_simple.sql`
- ❌ **Removed**: All profiles RLS policies (9 simplified policies)
- ✅ **Added**: Note referencing `01_profiles_rls.sql`
- ✅ **Kept**: All other dashboard table policies

### 2. Updated Application Scripts

#### `migrations/rls/05_apply_dashboard_rls_policies.sql`
- ✅ **Added**: `\i migrations/rls/01_profiles_rls.sql` before dashboard policies
- ✅ **Ensures**: Profiles policies are applied first (required for other policies)

#### `migrations/rls/07_apply_simple_dashboard_rls_policies.sql`
- ✅ **Added**: `\i migrations/rls/01_profiles_rls.sql` before dashboard policies
- ✅ **Ensures**: Profiles policies are applied first (required for other policies)

## File Structure

### Primary Profiles RLS File
```
migrations/rls/01_profiles_rls.sql
├── Complete profiles RLS policies (12 policies)
├── All SELECT, INSERT, UPDATE, DELETE operations
├── Role-based access control
└── Dashboard compatibility
```

### Dashboard RLS Files (No Profiles)
```
migrations/rls/04_dashboard_rls_policies.sql
├── All dashboard tables except profiles
├── Comprehensive policies (may cause infinite recursion)
└── References 01_profiles_rls.sql

migrations/rls/06_dashboard_rls_policies_simple.sql
├── All dashboard tables except profiles
├── Simplified policies (recommended)
└── References 01_profiles_rls.sql
```

### Application Scripts
```
migrations/rls/05_apply_dashboard_rls_policies.sql
├── Applies 01_profiles_rls.sql first
├── Then applies 04_dashboard_rls_policies.sql
└── Comprehensive dashboard setup

migrations/rls/07_apply_simple_dashboard_rls_policies.sql
├── Applies 01_profiles_rls.sql first
├── Then applies 06_dashboard_rls_policies_simple.sql
└── Simplified dashboard setup (RECOMMENDED)
```

## Benefits of Centralization

### 1. **Single Source of Truth**
- All profiles policies in one file
- No duplication or conflicts
- Easier to maintain and update

### 2. **Clear Dependencies**
- Profiles policies applied first
- Other policies can reference profiles table
- Proper initialization order

### 3. **Better Organization**
- Profiles-specific logic isolated
- Dashboard policies focused on dashboard tables
- Clear separation of concerns

### 4. **Easier Debugging**
- Profiles issues isolated to one file
- Clear policy hierarchy
- Simpler troubleshooting

## Complete Profiles Policies

The centralized `01_profiles_rls.sql` contains all 12 essential policies:

### SELECT Policies (6)
1. `"Users can view their own profile"`
2. `"Admins can view all profiles"`
3. `"Trainers can view student profiles"`
4. `"Public can view basic profiles"`
5. `"Trainers can view all profiles"`
6. `"Authenticated users can view profiles"`

### UPDATE Policies (3)
7. `"Users can update their own profile"`
8. `"Admins can update all profiles"`
9. `"Trainers can update student profiles"`

### INSERT Policies (2)
10. `"Allow profile creation during signup"`
11. `"Users can insert their own profile"`

### DELETE Policies (1)
12. `"Only admins can delete profiles"`

## Application Order

### Recommended Application Order
```bash
# 1. Apply profiles RLS policies first
psql -d your_database -f migrations/rls/01_profiles_rls.sql

# 2. Apply simplified dashboard policies (recommended)
psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql

# OR apply comprehensive dashboard policies
psql -d your_database -f migrations/rls/05_apply_dashboard_rls_policies.sql
```

### Alternative: Single Command
```bash
# Apply everything in correct order
psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql
```

## Verification

### Check Profiles Policies
```sql
-- Verify profiles policies are applied
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

### Check Dashboard Policies
```sql
-- Verify dashboard policies are applied (excluding profiles)
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN (
    'exercises', 'exercise_submissions', 'teacher_course_assignments',
    'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
    'groups', 'group_members', 'accounting', 'notifications'
)
GROUP BY tablename
ORDER BY tablename;
```

## Migration Notes

### Before Centralization
- Profiles policies scattered across multiple files
- Potential conflicts and duplication
- Harder to maintain and debug
- Unclear dependencies

### After Centralization
- All profiles policies in one dedicated file
- Clear dependencies and application order
- No duplication or conflicts
- Easier maintenance and debugging
- Better organization and separation of concerns

## Testing

The centralization maintains all functionality:

- ✅ User profile management works
- ✅ Admin dashboard functionality works
- ✅ Trainer student management works
- ✅ Dashboard access works
- ✅ Profile creation during signup works
- ✅ No infinite recursion issues
- ✅ All existing functionality preserved

The centralization ensures that profiles RLS policies are properly organized, maintained, and applied in the correct order for all dashboard functionality. 