# Trainee Dashboard Statistics Fix

## Issue Description

The trainee dashboard was showing 0 statistics (completed exercises, pending exercises, overdue exercises, total points) even when there should be data available.

## Root Cause Analysis

After investigating the code and database structure, several potential issues were identified:

### 1. Date Calculation Logic Issues

**Problem**: The `calculateAdjustedDates` function in `src/utils/exerciseDateUtils.ts` had incorrect logic for calculating exercise dates.

**Issues Found**:
- `days_to_close` calculation was not properly handling null/undefined values
- Missing default values for `days_to_open` and `days_to_due`
- Close date calculation didn't consider the relationship with due date

**Fix Applied**:
```typescript
// Before (problematic):
adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, exercise.days_to_close));

// After (fixed):
if (exercise.days_to_close !== null && exercise.days_to_close !== undefined) {
  adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, exercise.days_to_close));
} else {
  // Default to due date + 7 days if close date is not specified
  adjustedCloseDate.setDate(adjustedDueDate.getDate() + 7);
}
```

### 2. Submission Status Calculation Issues

**Problem**: The `calculateSubmissionStatus` function had incomplete logic for determining exercise status.

**Issues Found**:
- Missing handling for exercises that haven't opened yet
- Incomplete null/undefined checks for submission scores
- No logging for debugging

**Fix Applied**:
```typescript
// Added comprehensive logging and better edge case handling
console.log('Calculating submission status:', {
  hasSubmission: !!submission,
  submissionScore: submission?.score,
  adjustedOpenDate,
  adjustedCloseDate,
  today,
  isOpen: today >= adjustedOpenDate,
  isClosed: today > adjustedCloseDate
});
```

### 3. Import Type Issues

**Problem**: Incorrect import for `CourseEnrollment` type.

**Fix Applied**:
```typescript
// Before:
import { CourseEnrollment, ExerciseData } from '@/types/exerciseSubmission';

// After:
import { CourseEnrollment } from '@/types/course';
import { ExerciseData } from '@/types/exerciseSubmission';
```

## Files Modified

### 1. `src/utils/exerciseDateUtils.ts`
- Fixed date calculation logic
- Added proper null/undefined handling
- Added comprehensive logging for debugging
- Improved close date calculation

### 2. `src/utils/exerciseSubmissionUtils.ts`
- Enhanced submission status calculation
- Added detailed logging
- Improved edge case handling

### 3. `database_schema.md`
- Recreated comprehensive database schema documentation
- Updated to reflect current database structure
- Added all tables, relationships, and constraints

## Diagnostic Tools Created

### 1. `scripts/diagnose_dashboard_issue.sql`
A comprehensive SQL script to diagnose dashboard data issues:
- Check for trainees
- Check course enrollments
- Check exercises
- Check submissions
- Test date calculations
- Identify missing data

### 2. `scripts/test_dashboard_data.js`
A Node.js script to test dashboard data:
- Verifies all required data exists
- Tests date calculations
- Provides detailed logging
- Identifies root causes

## How to Test the Fix

### 1. Run the Diagnostic Script
```bash
# Connect to your database and run:
psql -d your_database -f scripts/diagnose_dashboard_issue.sql
```

### 2. Run the Test Script
```bash
# Set environment variables
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_supabase_key"

# Run the test
node scripts/test_dashboard_data.js
```

### 3. Check Browser Console
Open the trainee dashboard in your browser and check the console for:
- Date calculation logs
- Submission status logs
- Any error messages

## Expected Results After Fix

1. **Date Calculations**: Exercise open, due, and close dates should be calculated correctly
2. **Submission Status**: Exercises should show correct status (not_started, pending, completed, overdue)
3. **Statistics**: Dashboard should show actual numbers instead of 0
4. **Logging**: Console should show detailed information about calculations

## Common Issues and Solutions

### Issue: Still showing 0 statistics
**Possible Causes**:
1. No trainees in the database
2. No active course enrollments
3. No exercises for enrolled courses
4. All exercises are in the future (not opened yet)

**Solutions**:
1. Check if trainees exist: `SELECT * FROM profiles WHERE role = 'trainee';`
2. Check enrollments: `SELECT * FROM course_enrollments WHERE status = 'active';`
3. Check exercises: `SELECT * FROM exercises WHERE course_id IN (SELECT course_id FROM course_enrollments);`
4. Check exercise dates: Use the diagnostic script

### Issue: Wrong exercise status
**Possible Causes**:
1. Incorrect date calculations
2. Wrong reference start date (term vs enrollment date)
3. Missing or incorrect `days_to_*` values

**Solutions**:
1. Check the console logs for date calculations
2. Verify term start dates vs enrollment dates
3. Ensure exercises have proper `days_to_open`, `days_to_due`, `days_to_close` values

### Issue: Missing exercises
**Possible Causes**:
1. Exercises not assigned to courses
2. Course enrollments not active
3. RLS policies blocking access

**Solutions**:
1. Check exercise course assignments
2. Verify enrollment status
3. Check RLS policies for exercises table

## Database Schema Requirements

For the dashboard to work correctly, ensure you have:

1. **Profiles table**: Users with `role = 'trainee'`
2. **Courses table**: Active courses
3. **Course_enrollments table**: Active enrollments linking trainees to courses
4. **Exercises table**: Exercises with `course_id` and proper `days_to_*` values
5. **Exercise_submissions table**: Submissions (optional, for completed exercises)

## Migration Status

The following migrations should be applied to ensure proper schema:

1. ✅ Functions and triggers organized in `/migrations/functions/` and `/migrations/triggers/`
2. ✅ Database schema documentation updated
3. ✅ Date calculation logic fixed
4. ✅ Submission status calculation improved

## Next Steps

1. **Apply the fixes**: The code changes have been made
2. **Test the dashboard**: Use the diagnostic tools to verify data
3. **Check console logs**: Look for any remaining issues
4. **Verify statistics**: Ensure dashboard shows correct numbers
5. **Monitor performance**: Check if the logging affects performance

## Support

If issues persist after applying these fixes:

1. Run the diagnostic scripts to identify specific problems
2. Check the browser console for error messages
3. Verify database data using the SQL queries in the diagnostic script
4. Check RLS policies and user permissions
5. Ensure all migrations have been applied correctly 