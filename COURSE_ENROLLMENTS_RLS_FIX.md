# Course Enrollments RLS Infinite Recursion Fix

## Issue Description

When adding a student to a course, the API call was failing with the error:

```
"infinite recursion detected in policy for relation 'course_enrollments'"
```

This error occurs when Row Level Security (RLS) policies create circular references or complex nested queries that cause PostgreSQL to enter an infinite loop.

## Root Cause Analysis

The infinite recursion was caused by complex RLS policies in the `course_enrollments` table that:

1. **Referenced multiple tables in complex joins**: The policies were joining `teacher_course_assignments`, `profiles`, and `courses` tables
2. **Used nested EXISTS clauses**: Multiple levels of EXISTS subqueries created complex evaluation paths
3. **Created circular references**: Policies were referencing each other indirectly through table relationships
4. **Lacked proper separation of concerns**: Different user roles had overlapping policy logic

### Problematic Policy Example

```sql
-- This policy was causing infinite recursion
CREATE POLICY "Trainers can view assigned course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = course_enrollments.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);
```

## Solution

### 1. Simplified RLS Policies

The fix simplifies all RLS policies by:

- **Removing complex joins**: Eliminating references to `teacher_course_assignments` in course_enrollments policies
- **Using direct foreign key relationships**: Leveraging the direct `instructor_id` relationship in the `courses` table
- **Separating concerns**: Creating distinct policies for different user roles
- **Avoiding nested EXISTS clauses**: Using simpler, more direct conditions

### 2. New Simplified Policies

```sql
-- Admin policy (unchanged)
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- User policy (simplified)
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
FOR SELECT USING (
  auth.uid() = student_id
);

-- Trainer policy (simplified - uses direct course relationship)
CREATE POLICY "Trainers can view course enrollments" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_enrollments.course_id
    AND c.instructor_id = auth.uid()
  )
);
```

## Files Created

### 1. `migrations/rls/fix_course_enrollments_infinite_recursion.sql`
The main SQL fix that:
- Drops all existing problematic policies
- Creates new simplified policies
- Includes verification queries
- Provides detailed comments explaining the changes

### 2. `scripts/apply_course_enrollments_fix.sh`
A shell script to apply the fix using `psql`:
```bash
./scripts/apply_course_enrollments_fix.sh
```

### 3. `scripts/apply_course_enrollments_fix.js`
A Node.js script to apply the fix using Supabase client:
```bash
node scripts/apply_course_enrollments_fix.js
```

## How to Apply the Fix

### Option 1: Using the Shell Script (Recommended)
```bash
# Make sure DATABASE_URL is set in your environment
export DATABASE_URL="your_database_connection_string"

# Run the fix
./scripts/apply_course_enrollments_fix.sh
```

### Option 2: Using the Node.js Script
```bash
# Make sure environment variables are set in .env file
node scripts/apply_course_enrollments_fix.js
```

### Option 3: Manual Application
```bash
# Connect to your database and run the SQL file
psql your_database_url -f migrations/rls/fix_course_enrollments_infinite_recursion.sql
```

## Verification

After applying the fix, you can verify it worked by:

1. **Testing the API call**: Try adding a student to a course again
2. **Checking policies**: The new policies should be simpler and avoid complex joins
3. **Monitoring logs**: No more infinite recursion errors should appear

## Testing the Fix

### 1. Test Student Enrollment
```javascript
// Try adding a student to a course
const { data, error } = await supabase
  .from('course_enrollments')
  .insert({
    student_id: 'student-uuid',
    course_id: 'course-uuid',
    status: 'active'
  });

// Should not return infinite recursion error
```

### 2. Test Different User Roles
- **Admin**: Should be able to manage all enrollments
- **Trainer**: Should be able to view/update enrollments for their courses
- **Student**: Should be able to view/manage their own enrollments

## Prevention

To prevent similar issues in the future:

1. **Keep RLS policies simple**: Avoid complex joins and nested subqueries
2. **Use direct relationships**: Leverage foreign key relationships directly
3. **Separate concerns**: Create distinct policies for different user roles
4. **Test thoroughly**: Always test RLS policies with different user roles
5. **Monitor performance**: Complex policies can impact query performance

## Related Issues

This fix also addresses related issues:

- **API performance**: Simplified policies improve query performance
- **Data access**: Ensures proper access control without blocking legitimate operations
- **Maintainability**: Simpler policies are easier to understand and maintain

## Troubleshooting

If you still encounter issues after applying the fix:

1. **Check for remaining policies**: Ensure all old policies were dropped
2. **Verify RLS is enabled**: Confirm RLS is enabled on the table
3. **Test with different users**: Try with different user roles
4. **Check database logs**: Look for any remaining error messages

## Support

If you need help with this fix or encounter any issues:

1. Check the SQL file comments for detailed explanations
2. Review the verification queries in the fix script
3. Test with the provided test cases
4. Monitor database logs for any error messages 