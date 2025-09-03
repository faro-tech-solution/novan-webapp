# Student Courses Page Fix

## Issue Description

The `/student-courses` page is not fetching any data and shows "No courses found" even when there should be enrolled courses available.

## Root Cause Analysis

After investigating the code and API calls, several potential issues were identified:

### 1. Data Flow Analysis

The student courses page uses the `useStudentCoursesQuery` hook which:
1. Fetches course enrollments for the current user
2. Filters for active enrollments only
3. Joins with the courses table
4. Transforms the data to match the `StudentCourse` interface

### 2. Potential Issues

#### A. No Trainees in Database
- If there are no users with `role = 'trainee'`, the page will show empty
- Check: `SELECT * FROM profiles WHERE role = 'trainee';`

#### B. No Course Enrollments
- If trainees exist but have no enrollments, the page will show empty
- Check: `SELECT * FROM course_enrollments WHERE status = 'active';`

#### C. No Active Enrollments
- If enrollments exist but none are 'active', the page will show empty
- Check: `SELECT status, COUNT(*) FROM course_enrollments GROUP BY status;`

#### D. RLS Policy Issues
- Row Level Security policies might be blocking access to course_enrollments
- Check RLS policies on the course_enrollments table

#### E. Authentication Issues
- User might not be properly authenticated
- User ID might not match the expected format

#### F. Foreign Key Issues
- Enrollments might reference non-existent courses or students
- Check foreign key constraints

## Diagnostic Tools Created

### 1. `scripts/diagnose_student_courses_issue.sql`
A comprehensive SQL script to diagnose the issue:
- Check for trainees
- Check course enrollments
- Check enrollment statuses
- Check courses table
- Check for orphaned enrollments
- Test the exact frontend query
- Check RLS policies
- Check foreign key constraints

### 2. `scripts/test_student_courses_api.js`
A Node.js script to test the API calls:
- Tests the exact same query as the frontend
- Verifies data transformation
- Provides detailed logging
- Identifies where the data flow breaks

## How to Diagnose the Issue

### Step 1: Run the SQL Diagnostic Script
```bash
# Connect to your database and run:
psql -d your_database -f scripts/diagnose_student_courses_issue.sql
```

### Step 2: Run the API Test Script
```bash
# Set environment variables
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_supabase_key"

# Run the test
node scripts/test_student_courses_api.js
```

### Step 3: Check Browser Console
1. Open the student courses page in your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Refresh the page
5. Look for API calls to course_enrollments
6. Check for any error messages

### Step 4: Check Authentication
1. In the browser console, check if the user is authenticated:
```javascript
// In browser console
console.log('User:', window.supabase?.auth?.user());
```

## Common Issues and Solutions

### Issue 1: No Trainees Found
**Symptoms**: Diagnostic shows 0 trainees
**Solution**: 
1. Create a trainee user:
```sql
INSERT INTO profiles (id, first_name, last_name, email, role) 
VALUES ('user-uuid', 'Test', 'Trainee', 'test@example.com', 'trainee');
```

### Issue 2: No Course Enrollments
**Symptoms**: Trainees exist but no enrollments
**Solution**:
1. Create a course first:
```sql
INSERT INTO courses (id, name, instructor_id, instructor_name, status) 
VALUES ('course-uuid', 'Test Course', 'instructor-uuid', 'Test Instructor', 'active');
```

2. Create an enrollment:
```sql
INSERT INTO course_enrollments (course_id, student_id, status) 
VALUES ('course-uuid', 'trainee-uuid', 'active');
```

### Issue 3: RLS Policy Issues
**Symptoms**: Data exists but API returns empty
**Solution**: Check and fix RLS policies on course_enrollments:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'course_enrollments';

-- Create policy to allow students to see their own enrollments
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
FOR SELECT USING (auth.uid() = student_id);
```

### Issue 4: Authentication Issues
**Symptoms**: User not authenticated or wrong user ID
**Solution**:
1. Check if user is logged in
2. Verify user ID format matches database
3. Check if user has a profile record

### Issue 5: Foreign Key Issues
**Symptoms**: Orphaned enrollments
**Solution**:
1. Clean up orphaned enrollments:
```sql
DELETE FROM course_enrollments 
WHERE student_id NOT IN (SELECT id FROM profiles)
   OR course_id NOT IN (SELECT id FROM courses);
```

## Code Review Findings

### 1. useStudentCoursesQuery Hook
The hook looks correct but has some potential issues:
- Uses `user?.id` from AuthContext
- Filters for `status = 'active'` only
- Filters out enrollments with invalid course data

### 2. Data Transformation
The transformation logic is sound:
- Maps enrollment data to StudentCourse interface
- Provides default values for missing fields
- Handles null/undefined cases

### 3. Error Handling
The hook has basic error handling but could be improved:
- Throws generic error messages
- Could provide more specific error information

## Recommended Fixes

### 1. Add Better Logging
Update the `useStudentCoursesQuery` hook to add logging:

```typescript
const fetchStudentCourses = async (userId: string | undefined): Promise<StudentCourse[]> => {
  console.log('Fetching student courses for user:', userId);
  
  if (!userId) {
    console.log('No user ID provided');
    return [];
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      enrolled_at,
      status,
      courses (
        id,
        name,
        description
      )
    `)
    .eq('student_id', userId)
    .eq('status', 'active');

  console.log('Enrollments query result:', { enrollments, error: enrollmentsError });

  if (enrollmentsError) {
    console.error('Enrollments error:', enrollmentsError);
    throw new Error('خطا در دریافت دوره‌ها');
  }

  const enrollmentsWithCourses = (enrollments || []).filter(
    (enrollment) => enrollment.courses && typeof enrollment.courses === 'object' && !('code' in enrollment.courses)
  );

  console.log('Filtered enrollments:', enrollmentsWithCourses);

  // ... rest of the function
};
```

### 2. Add Fallback for Inactive Enrollments
Consider showing inactive enrollments as well:

```typescript
// Instead of filtering for 'active' only, show all enrollments
.eq('student_id', userId)
// Remove the .eq('status', 'active') filter
```

### 3. Improve Error Messages
Provide more specific error messages:

```typescript
if (enrollmentsError) {
  console.error('Error fetching enrollments:', enrollmentsError);
  if (enrollmentsError.code === 'PGRST116') {
    throw new Error('دسترسی به دوره‌ها محدود شده است');
  }
  throw new Error(`خطا در دریافت دوره‌ها: ${enrollmentsError.message}`);
}
```

## Testing Checklist

After applying fixes, test the following:

1. **Database Data**:
   - [ ] Trainees exist in profiles table
   - [ ] Courses exist in courses table
   - [ ] Active enrollments exist in course_enrollments table
   - [ ] No orphaned enrollments

2. **Authentication**:
   - [ ] User is properly authenticated
   - [ ] User has correct role (trainee)
   - [ ] User ID matches database format

3. **RLS Policies**:
   - [ ] course_enrollments table has appropriate policies
   - [ ] Users can access their own enrollments
   - [ ] No overly restrictive policies

4. **API Calls**:
   - [ ] Network requests succeed
   - [ ] No CORS errors
   - [ ] Response contains expected data

5. **Frontend**:
   - [ ] Page loads without errors
   - [ ] Courses are displayed
   - [ ] Loading states work correctly
   - [ ] Error handling works

## Next Steps

1. **Run the diagnostic scripts** to identify the specific issue
2. **Check the browser console** for any error messages
3. **Verify database data** using the SQL queries
4. **Apply the appropriate fix** based on the diagnosis
5. **Test the page** to ensure it works correctly

## Support

If issues persist after applying these fixes:

1. Run the diagnostic scripts and share the output
2. Check browser console for error messages
3. Verify RLS policies are correctly configured
4. Ensure all foreign key relationships are intact
5. Check if the user has proper authentication 