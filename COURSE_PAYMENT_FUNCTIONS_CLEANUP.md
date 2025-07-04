# Course Payment Functions Cleanup

## Overview

This document explains the cleanup of redundant course payment functions in the database.

## Background

In our database, we identified multiple functions and triggers related to course payments, including duplicates with similar Persian names (پرداخت شهریه دوره). This created confusion and potential issues with database triggers firing multiple times or inconsistently.

## Changes Made

The `cleanup_course_payment_functions.sql` migration:

1. Drops any duplicate or unused triggers related to course payments:

   - `on_course_purchase`
   - `course_payment_trigger`
   - `handle_enrollment_payment`
   - `process_course_payment`

2. Drops any redundant functions (while preserving our main function):

   - `handle_course_purchase()`
   - `process_course_payment()`
   - `handle_enrollment_payment()`

3. Ensures our `handle_course_enrollment_payment` function remains the only trigger function handling course payments.

## Expected Result

After this migration, there should be:

- Only one active trigger on the `course_enrollments` table: `on_course_enrollment_payment`
- Only one function handling course payment logic: `handle_course_enrollment_payment()`

## Verification

To verify the cleanup was successful, run these SQL queries:

```sql
-- Check triggers on course_enrollments table
SELECT tgname FROM pg_trigger WHERE tgrelid = 'course_enrollments'::regclass::oid;

-- Check functions related to course payments
SELECT proname FROM pg_proc WHERE proname LIKE '%course%' OR proname LIKE '%payment%';
```

## Rollback Information

The rollback script is intentionally empty as restoring redundant functions would cause more issues than it would solve. If needed, consult database backups for the original function definitions.
