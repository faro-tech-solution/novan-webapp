# Complete Profiles RLS Policies Documentation

## Overview

This document describes the complete Row Level Security (RLS) policies for the `profiles` table. These policies ensure proper access control while allowing all necessary functionality for user management, dashboards, and student management.

## Table Structure

The `profiles` table contains user profile information linked to Supabase Auth users:

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email text,
  role text DEFAULT 'trainee' CHECK (role IN ('trainer', 'trainee', 'admin')),
  class_id text,
  class_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gender text,
  job text,
  education text,
  phone_number text,
  country text,
  city text,
  birthday date,
  ai_familiarity text CHECK (ai_familiarity IN ('beginner', 'intermediate', 'advanced', 'expert')),
  english_level text CHECK (english_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  whatsapp_id text,
  telegram_id text,
  is_demo boolean NOT NULL DEFAULT false,
  language_preference TEXT DEFAULT 'fa',
  PRIMARY KEY (id)
);
```

## Complete RLS Policies

### 1. SELECT Policies (Read Access)

#### Policy 1: "Users can view their own profile"
- **Purpose**: Users can view their own profile information
- **Access**: `auth.uid() = id`
- **Use Case**: Profile page, user settings

#### Policy 2: "Admins can view all profiles"
- **Purpose**: Administrators can view all user profiles
- **Access**: User must have `role = 'admin'`
- **Use Case**: Admin dashboard, user management

#### Policy 3: "Trainers can view student profiles"
- **Purpose**: Trainers can view student profiles for their assigned courses
- **Access**: User must have `role = 'trainer'` AND target must be `role = 'trainee'` OR own profile
- **Use Case**: Student management, course assignments

#### Policy 4: "Public can view basic profiles"
- **Purpose**: Basic profile information is publicly readable
- **Access**: Target must have valid role (`trainee`, `trainer`, `admin`)
- **Use Case**: Course enrollment, user lists

#### Policy 5: "Trainers can view all profiles"
- **Purpose**: Trainers can view all profiles for student management
- **Access**: User must have `role = 'trainer'`
- **Use Case**: Student management dashboard

#### Policy 6: "Authenticated users can view profiles"
- **Purpose**: All authenticated users can view profiles (needed for dashboards)
- **Access**: `auth.role() = 'authenticated'`
- **Use Case**: Dashboard functionality, course enrollment

### 2. UPDATE Policies (Modify Access)

#### Policy 7: "Users can update their own profile"
- **Purpose**: Users can update their own profile information
- **Access**: `auth.uid() = id`
- **Use Case**: Profile editing, user settings

#### Policy 8: "Admins can update all profiles"
- **Purpose**: Administrators can update any user profile
- **Access**: User must have `role = 'admin'`
- **Use Case**: Admin user management

#### Policy 9: "Trainers can update student profiles"
- **Purpose**: Trainers can update student profiles for management purposes
- **Access**: User must have `role = 'trainer'` AND target must be `role = 'trainee'` OR own profile
- **Use Case**: Student profile management, course assignments

### 3. INSERT Policies (Create Access)

#### Policy 10: "Allow profile creation during signup"
- **Purpose**: Allow automatic profile creation during user registration
- **Access**: `auth.uid() = id`
- **Use Case**: Trigger function `handle_new_user()`

#### Policy 11: "Users can insert their own profile"
- **Purpose**: Users can create their own profile
- **Access**: `auth.uid() = id`
- **Use Case**: Manual profile creation, data migration

### 4. DELETE Policies (Remove Access)

#### Policy 12: "Only admins can delete profiles"
- **Purpose**: Only administrators can delete user profiles
- **Access**: User must have `role = 'admin'`
- **Use Case**: Admin user management, account cleanup

## Policy Hierarchy and Security

### Security Model

1. **Self-Access**: Users always have full access to their own profile
2. **Role-Based Access**: Different roles have different access levels
3. **Dashboard Access**: Policies ensure dashboard functionality works
4. **Student Management**: Trainers can manage student profiles
5. **Admin Override**: Admins have full access to all profiles

### Access Matrix

| Operation | User (Self) | Trainer | Admin | Public |
|-----------|-------------|---------|-------|--------|
| View Own Profile | ✅ | ✅ | ✅ | ❌ |
| View Other Profiles | ❌ | ✅ (Students) | ✅ | ✅ (Basic) |
| Update Own Profile | ✅ | ✅ | ✅ | ❌ |
| Update Other Profiles | ❌ | ✅ (Students) | ✅ | ❌ |
| Create Profile | ✅ | ❌ | ❌ | ❌ |
| Delete Profile | ❌ | ❌ | ✅ | ❌ |

## Implementation Files

### Primary Files

1. **`migrations/rls/01_profiles_rls.sql`** - Complete profiles RLS policies
2. **`migrations/rls/04_dashboard_rls_policies.sql`** - Comprehensive dashboard policies (includes profiles)
3. **`migrations/rls/06_dashboard_rls_policies_simple.sql`** - Simplified dashboard policies (includes profiles)

### Application Scripts

1. **`migrations/rls/05_apply_dashboard_rls_policies.sql`** - Apply comprehensive policies
2. **`migrations/rls/07_apply_simple_dashboard_rls_policies.sql`** - Apply simplified policies (RECOMMENDED)

## Usage Examples

### Frontend Usage

```typescript
// User viewing their own profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Admin viewing all profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });

// Trainer viewing student profiles
const { data: students } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'trainee');
```

### Backend Usage

```sql
-- Check if user can view a specific profile
SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role = 'admin'
) OR auth.uid() = 'target-profile-id';

-- Check if user can update a profile
SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role = 'admin'
) OR auth.uid() = 'target-profile-id';
```

## Testing

### Test Scripts

1. **`migrations/rls/test_dashboard_rls.sql`** - Test dashboard RLS policies
2. **`migrations/rls/test_simple_rls.sql`** - Test simplified RLS policies

### Test Commands

```bash
# Test dashboard policies
psql -d your_database -f migrations/rls/test_dashboard_rls.sql

# Test simplified policies
psql -d your_database -f migrations/rls/test_simple_rls.sql
```

## Troubleshooting

### Common Issues

1. **Infinite Recursion**: Use simplified policies to avoid complex joins
2. **Dashboard Access**: Ensure authenticated users can view profiles
3. **Student Management**: Verify trainer policies allow student access
4. **Profile Creation**: Check trigger function has proper INSERT policy

### Debugging

```sql
-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test specific access
SELECT auth.uid(), auth.role();
```

## Migration Notes

### Recent Changes

1. **Added INSERT policies** for profile creation during signup
2. **Added DELETE policies** for admin-only profile deletion
3. **Enhanced trainer policies** for student management
4. **Added dashboard access** for authenticated users

### Compatibility

- All policies are backward compatible
- Existing functionality is preserved
- New policies enhance security without breaking features

## Security Considerations

1. **Principle of Least Privilege**: Users only have access they need
2. **Role-Based Access**: Clear separation between user roles
3. **Dashboard Compatibility**: Policies ensure dashboard functionality
4. **Data Protection**: Sensitive operations require admin privileges
5. **Audit Trail**: All operations are logged through RLS policies 