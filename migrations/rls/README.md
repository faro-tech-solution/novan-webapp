# Row Level Security (RLS) Policies

This directory contains Row Level Security policies for the database tables to ensure proper access control, fix the course_enrollments API issue, and enable admin and trainer dashboards.

## Overview

The RLS policies are designed to:
1. Fix the course_enrollments API issue where related data (courses, course_terms) was empty
2. Ensure proper access control based on user roles
3. Allow authenticated users to view necessary data for the API to work
4. Maintain security by restricting access based on relationships
5. Enable admin and trainer dashboards to access required data

## Files

### Dashboard RLS Policies (New - Required for Admin/Trainer Dashboards)
- `04_dashboard_rls_policies.sql` - Comprehensive RLS policies for all dashboard tables (may cause infinite recursion)
- `05_apply_dashboard_rls_policies.sql` - Master script to apply all dashboard RLS policies
- `06_dashboard_rls_policies_simple.sql` - Simplified RLS policies for all dashboard tables (RECOMMENDED - avoids infinite recursion)
- `07_apply_simple_dashboard_rls_policies.sql` - Master script to apply simplified dashboard RLS policies
- `cleanup_dashboard_policies.sql` - Cleanup script to remove existing dashboard policies
- `test_dashboard_rls.sql` - Test script for dashboard RLS policies

### Course RLS Policies
- `00_apply_all_rls_policies.sql` - Master script that applies all RLS policies in the correct order.
- `00_apply_simple_rls_policies.sql` - Master script that applies simplified RLS policies to avoid infinite recursion (RECOMMENDED).

### `01_courses_rls_policies.sql`
RLS policies for the `courses` table:
- **Users can view courses**: All authenticated users can view courses (fixes API issue)
- **Instructors can manage their own courses**: Full access for course creators
- **Admins can manage all courses**: Full access for administrators
- **Students can view enrolled courses**: Students can view courses they're enrolled in
- **Public can view active courses**: Optional public access to active courses
- **Trainers can view/update assigned courses**: Trainers can access courses they're assigned to
- **Instructors can update/delete their courses**: Limited management for instructors

### `01_courses_rls_policies_simple.sql`
Simplified RLS policies for the `courses` table (RECOMMENDED):
- **Users can view courses**: All authenticated users can view courses (fixes API issue)
- **Instructors can manage their own courses**: Full access for course creators
- **Admins can manage all courses**: Full access for administrators
- **Public can view active courses**: Optional public access to active courses
- **Instructors can delete their courses**: Limited management for instructors
- **Admins can manage all courses**: Full access for administrators
- **Students can view enrolled courses**: Students can view courses they're enrolled in
- **Public can view active courses**: Optional public access to active courses
- **Trainers can view/update assigned courses**: Trainers can access courses they're assigned to
- **Instructors can update/delete their courses**: Limited management for instructors

### Dashboard RLS Policies Details

The dashboard RLS policies cover all tables needed by admin and trainer dashboards:

#### Profiles Table
- **Users**: Can view and update their own profile
- **Admins**: Can view and update all profiles
- **Trainers**: Can view student profiles and their own profile

#### Exercises Table
- **Users**: Can view all exercises (needed for dashboards)
- **Instructors**: Can manage their own exercises
- **Admins**: Can manage all exercises
- **Trainers**: Can view exercises for their assigned courses

#### Exercise Submissions Table
- **Students**: Can view and create their own submissions
- **Instructors**: Can view and grade submissions for their exercises
- **Admins**: Can view and grade all submissions
- **Trainers**: Can view submissions for their assigned courses

#### Teacher Course Assignments Table
- **Teachers**: Can view their own assignments
- **Admins**: Can manage all assignments

#### Awards Table
- **Users**: Can view all awards (needed for dashboards)
- **Admins**: Can manage all awards

#### Student Awards Table
- **Students**: Can view their own awards
- **Admins**: Can view all awards
- **Trainers**: Can view student awards

#### Daily Activities Table
- **Users**: Can view all daily activities (needed for dashboards)
- **Admins**: Can manage all daily activities

#### Tasks Table
- **Users**: Can view their assigned tasks
- **Admins**: Can manage all tasks
- **Teammates**: Can view their assigned tasks

#### Subtasks Table
- **Users**: Can view subtasks for their tasks
- **Admins**: Can manage all subtasks

#### Groups Table
- **Users**: Can view all groups (needed for dashboards)
- **Admins**: Can manage all groups

#### Group Members Table
- **Users**: Can view their own group memberships
- **Admins**: Can manage all group members

#### Accounting Table
- **Users**: Can view their own accounting records
- **Admins**: Can view all accounting records

#### Notifications Table
- **Users**: Can view their own notifications
- **Admins**: Can view all notifications

### `02_course_enrollments_rls_policies.sql`
RLS policies for the `course_enrollments` table:
- **Users can view their own enrollments**: Students can view their enrollments
- **Instructors can view course enrollments**: Course creators can view enrollments
- **Admins can manage all enrollments**: Full access for administrators
- **Students can manage their own enrollments**: Students can create/update their enrollments
- **Trainers can view/update assigned course enrollments**: Trainers can access enrollments for assigned courses
- **Users can create enrollments for available courses**: Enrollment creation with validation

### `03_course_terms_rls_policies.sql`
RLS policies for the `course_terms` table:
- **Users can view course terms**: All authenticated users can view terms (fixes API issue)
- **Instructors can manage course terms**: Course creators can manage terms
- **Admins can manage all course terms**: Full access for administrators
- **Trainers can view/update assigned course terms**: Trainers can access terms for assigned courses
- **Instructors can manage course terms**: Instructors can manage terms for their courses

## Key Features

### API Issue Fix
The main issue with the course_enrollments API was that RLS policies were too restrictive, preventing the API from fetching related course and course_terms data. The new policies include:

1. **Basic read access**: All authenticated users can view courses and course_terms
2. **Proper relationship handling**: Policies check for proper relationships between tables
3. **Role-based access**: Different access levels based on user roles

### Security Features
- **Role-based access control**: Different permissions for admins, instructors, trainers, and students
- **Relationship validation**: Policies check for proper relationships (e.g., course ownership, enrollment status)
- **Data integrity**: Prevents unauthorized access while allowing necessary operations

### Performance Optimizations
- **Indexes**: Created indexes on frequently queried columns to improve RLS policy performance
- **Efficient queries**: Policies use EXISTS clauses for better performance
- **Minimal overhead**: Policies are designed to minimize query overhead

## Application

### Apply Dashboard RLS Policies (Required for Admin/Trainer Dashboards)
```bash
# RECOMMENDED: Apply simplified dashboard RLS policies (avoids infinite recursion)
psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql

# Alternative: Apply comprehensive dashboard RLS policies (may cause infinite recursion)
psql -d your_database -f migrations/rls/05_apply_dashboard_rls_policies.sql

# If you encounter infinite recursion, first clean up existing policies
psql -d your_database -f migrations/rls/cleanup_dashboard_policies.sql
psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql

# Test the dashboard policies
psql -d your_database -f migrations/rls/test_dashboard_rls.sql
```

### Apply Course RLS Policies
```bash
# RECOMMENDED: Use the simplified master script to avoid infinite recursion
psql -d your_database -f migrations/rls/00_apply_simple_rls_policies.sql

# Alternative: Use the original master script (may cause infinite recursion)
psql -d your_database -f migrations/rls/00_apply_all_rls_policies.sql

# Or run cleanup first, then apply simplified policies
psql -d your_database -f migrations/rls/cleanup_existing_policies.sql
psql -d your_database -f migrations/rls/01_courses_rls_policies_simple.sql
psql -d your_database -f migrations/rls/02_course_enrollments_rls_policies_simple.sql
psql -d your_database -f migrations/rls/03_course_terms_rls_policies_simple.sql
```

### Apply Individual Policies
```bash
# Check existing policies first
psql -d your_database -f migrations/rls/check_existing_policies.sql

# Apply simplified dashboard policies (RECOMMENDED)
psql -d your_database -f migrations/rls/06_dashboard_rls_policies_simple.sql

# Alternative: Apply comprehensive dashboard policies (may cause infinite recursion)
psql -d your_database -f migrations/rls/04_dashboard_rls_policies.sql

# Apply course policies for specific tables
psql -d your_database -f migrations/rls/01_courses_rls_policies.sql
psql -d your_database -f migrations/rls/02_course_enrollments_rls_policies.sql
psql -d your_database -f migrations/rls/03_course_terms_rls_policies.sql
```

## Verification

After applying the policies, you can verify they're working correctly:

### Check RLS Status
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN (
  'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
  'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
  'groups', 'group_members', 'accounting', 'notifications',
  'courses', 'course_enrollments', 'course_terms'
);
```

### List All Policies
```sql
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN (
  'profiles', 'exercises', 'exercise_submissions', 'teacher_course_assignments',
  'awards', 'student_awards', 'daily_activities', 'tasks', 'subtasks',
  'groups', 'group_members', 'accounting', 'notifications',
  'courses', 'course_enrollments', 'course_terms'
)
ORDER BY tablename, policyname;
```

### Test API Access
Use the diagnostic scripts in the `scripts/` directory to test the course_enrollments API:
- `scripts/diagnose_course_enrollments_api.sql`
- `scripts/test_course_enrollments_api.js`

### Test Dashboard Access
Use the dashboard test script to verify admin and trainer dashboard access:
- `migrations/rls/test_dashboard_rls.sql`

## Troubleshooting

### Common Issues

1. **API still returning empty related data**:
   - Check if RLS is enabled on all tables
   - Verify policies allow the current user to access the data
   - Check for proper foreign key relationships

2. **Permission denied errors**:
   - Verify user authentication
   - Check user role in profiles table
   - Ensure policies match the user's role and relationships

3. **Performance issues**:
   - Check if indexes are created
   - Monitor query execution plans
   - Consider optimizing policy queries

4. **Dashboard data not loading**:
   - Ensure dashboard RLS policies are applied
   - Verify user has correct role (admin, trainer, trainee)
   - Check trainers have course assignments in `teacher_course_assignments` table
   - Check students have active enrollments in `course_enrollments` table

5. **Infinite recursion in dashboard policies**:
   - Use the simplified dashboard RLS policies instead of comprehensive ones
   - Clean up existing policies first: `psql -d your_database -f migrations/rls/cleanup_dashboard_policies.sql`
   - Apply simplified policies: `psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql`

5. **Infinite recursion in dashboard policies**:
   - Use the simplified dashboard RLS policies instead of comprehensive ones
   - Clean up existing policies first: `psql -d your_database -f migrations/rls/cleanup_dashboard_policies.sql`
   - Apply simplified policies: `psql -d your_database -f migrations/rls/07_apply_simple_dashboard_rls_policies.sql`

### Debugging

1. **Check current user**:
   ```sql
   SELECT auth.uid(), auth.role();
   ```

2. **Test policy access**:
   ```sql
   -- Test if user can access courses
   SELECT COUNT(*) FROM courses;
   
   -- Test if user can access course_enrollments
   SELECT COUNT(*) FROM course_enrollments;
   
   -- Test if user can access course_terms
   SELECT COUNT(*) FROM course_terms;
   ```

3. **Check user relationships**:
   ```sql
   -- Check user role
   SELECT role FROM profiles WHERE id = auth.uid();
   
   -- Check course enrollments
   SELECT * FROM course_enrollments WHERE student_id = auth.uid();
   
   -- Check course assignments
   SELECT * FROM teacher_course_assignments WHERE teacher_id = auth.uid();
   
   -- Check dashboard access for trainers
   SELECT COUNT(*) FROM teacher_course_assignments WHERE teacher_id = auth.uid();
   
   -- Check dashboard access for students
   SELECT COUNT(*) FROM course_enrollments WHERE student_id = auth.uid() AND status = 'active';
   ```

## Rollback

If you need to rollback the RLS policies:

```sql
-- Disable RLS on dashboard tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_course_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE awards DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_awards DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounting DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on course tables
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_terms DISABLE ROW LEVEL SECURITY;

-- Drop all policies (example for one table)
DROP POLICY IF EXISTS "Users can view courses" ON courses;
-- ... (repeat for all policies)
```

## Notes

- Dashboard RLS policies are required for admin and trainer dashboards to function
- These policies are designed to work with the existing database schema
- They assume proper foreign key relationships exist
- They require the `auth` schema to be available (Supabase)
- They assume user roles are stored in the `profiles` table
- Performance may vary based on data volume and query patterns
- Dashboard policies include performance indexes for better query performance 