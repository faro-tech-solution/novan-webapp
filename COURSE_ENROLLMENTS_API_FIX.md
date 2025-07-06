# Course Enrollments API Fix

## Issue Description

The API call to `rest/v1/course_enrollments` is returning enrollments but the related data (courses, course_terms) is empty. The API URL shows:

```
rest/v1/course_enrollments?select=course_id%2Cenrolled_at%2Cterm_id%2Ccourses%28id%2Cname%29%2Ccourse_terms%28id%2Cstart_date%2Cend_date%29&student_id=eq.af3bb07e-8fc3-40c1-9222-430c6c48eabd&status=eq.active
```

This translates to:
```sql
SELECT course_id, enrolled_at, term_id, 
       courses(id, name), 
       course_terms(id, start_date, end_date)
FROM course_enrollments 
WHERE student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd' 
  AND status = 'active'
```

## Root Cause Analysis

The issue is likely one of the following:

### 1. **Orphaned Foreign Keys**
- `course_id` in enrollments references non-existent courses
- `term_id` in enrollments references non-existent course_terms

### 2. **RLS Policy Issues**
- Row Level Security policies on `courses` or `course_terms` tables are blocking access
- The current user doesn't have permission to view the related data

### 3. **Data Integrity Issues**
- Courses or terms were deleted but enrollments still reference them
- Foreign key constraints are not properly enforced

### 4. **Table Structure Issues**
- Foreign key relationships are not properly defined
- Column data types don't match between tables

## Diagnostic Tools Created

### 1. `scripts/diagnose_course_enrollments_api.sql`
A comprehensive SQL script to investigate:
- Check if the specific user's enrollments exist
- Verify if referenced courses exist
- Verify if referenced terms exist
- Check for orphaned foreign keys
- Test the exact API query structure
- Check foreign key constraints
- Check RLS policies
- Check data types and triggers

### 2. `scripts/test_course_enrollments_api.js`
A Node.js script to test:
- The exact API call that's failing
- Individual table access
- Separate joins for courses and terms
- RLS policy impact
- Data transformation

## How to Diagnose the Issue

### Step 1: Run the SQL Diagnostic Script
```bash
# Connect to your database and run:
psql -d your_database -f scripts/diagnose_course_enrollments_api.sql
```

### Step 2: Run the API Test Script
```bash
# Set environment variables
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_supabase_key"

# Run the test
node scripts/test_course_enrollments_api.js
```

### Step 3: Check Browser Network Tab
1. Open the student courses page
2. Open Developer Tools (F12)
3. Go to Network tab
4. Look for the course_enrollments API call
5. Check the response for any error messages

## Common Issues and Solutions

### Issue 1: Orphaned Course References
**Symptoms**: Enrollments exist but `courses` is null/empty
**Diagnosis**: 
```sql
SELECT ce.id, ce.course_id, c.id as course_exists
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND c.id IS NULL;
```

**Solutions**:
1. **Create missing courses**:
```sql
INSERT INTO courses (id, name, instructor_id, instructor_name, status)
VALUES ('missing-course-id', 'Course Name', 'instructor-id', 'Instructor Name', 'active');
```

2. **Clean up orphaned enrollments**:
```sql
DELETE FROM course_enrollments 
WHERE course_id NOT IN (SELECT id FROM courses);
```

3. **Add foreign key constraint** (if missing):
```sql
ALTER TABLE course_enrollments 
ADD CONSTRAINT fk_course_enrollments_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
```

### Issue 2: Orphaned Term References
**Symptoms**: Enrollments have `term_id` but `course_terms` is null/empty
**Diagnosis**:
```sql
SELECT ce.id, ce.term_id, ct.id as term_exists
FROM course_enrollments ce
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND ce.term_id IS NOT NULL
  AND ct.id IS NULL;
```

**Solutions**:
1. **Create missing terms**:
```sql
INSERT INTO course_terms (id, name, course_id, start_date, end_date)
VALUES ('missing-term-id', 'Term Name', 'course-id', '2024-01-01', '2024-12-31');
```

2. **Set term_id to NULL** (if terms are optional):
```sql
UPDATE course_enrollments 
SET term_id = NULL 
WHERE term_id NOT IN (SELECT id FROM course_terms);
```

3. **Add foreign key constraint** (if missing):
```sql
ALTER TABLE course_enrollments 
ADD CONSTRAINT fk_course_enrollments_term_id 
FOREIGN KEY (term_id) REFERENCES course_terms(id) ON DELETE SET NULL;
```

### Issue 3: RLS Policy Issues
**Symptoms**: Data exists but API returns empty related data
**Diagnosis**: Check RLS policies on related tables
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('courses', 'course_terms')
ORDER BY tablename, policyname;
```

**Solutions**:
1. **Create RLS policy for courses**:
```sql
CREATE POLICY "Users can view courses" ON courses
FOR SELECT USING (true); -- Or more restrictive based on your needs
```

2. **Create RLS policy for course_terms**:
```sql
CREATE POLICY "Users can view course terms" ON course_terms
FOR SELECT USING (true); -- Or more restrictive based on your needs
```

3. **Check if RLS is enabled**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('courses', 'course_terms');
```

### Issue 4: Data Type Mismatches
**Symptoms**: Foreign keys don't match due to different data types
**Diagnosis**:
```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
  AND column_name IN ('course_id', 'term_id', 'student_id');
```

**Solutions**:
1. **Ensure consistent UUID types**:
```sql
-- Check if all foreign key columns are UUID type
ALTER TABLE course_enrollments 
ALTER COLUMN course_id TYPE uuid USING course_id::uuid;

ALTER TABLE course_enrollments 
ALTER COLUMN term_id TYPE uuid USING term_id::uuid;
```

## Testing the Fix

### 1. Test Individual Tables
```sql
-- Test courses table
SELECT * FROM courses LIMIT 5;

-- Test course_terms table  
SELECT * FROM course_terms LIMIT 5;

-- Test course_enrollments table
SELECT * FROM course_enrollments 
WHERE student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
LIMIT 5;
```

### 2. Test Joins Manually
```sql
-- Test courses join
SELECT ce.id, ce.course_id, c.name
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND ce.status = 'active';

-- Test terms join
SELECT ce.id, ce.term_id, ct.name
FROM course_enrollments ce
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND ce.status = 'active';
```

### 3. Test the Full API Query
```sql
-- Test the exact API query
SELECT 
  ce.course_id,
  ce.enrolled_at,
  ce.term_id,
  c.id as course_id_from_join,
  c.name as course_name,
  ct.id as term_id_from_join,
  ct.start_date,
  ct.end_date
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.student_id = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd'
  AND ce.status = 'active';
```

## Prevention Measures

### 1. Add Foreign Key Constraints
```sql
-- Add foreign key constraints if missing
ALTER TABLE course_enrollments 
ADD CONSTRAINT fk_course_enrollments_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE course_enrollments 
ADD CONSTRAINT fk_course_enrollments_term_id 
FOREIGN KEY (term_id) REFERENCES course_terms(id) ON DELETE SET NULL;
```

### 2. Add Data Validation Triggers
```sql
-- Create trigger to validate course existence
CREATE OR REPLACE FUNCTION validate_course_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE id = NEW.course_id) THEN
    RAISE EXCEPTION 'Course with id % does not exist', NEW.course_id;
  END IF;
  
  IF NEW.term_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM course_terms WHERE id = NEW.term_id) THEN
    RAISE EXCEPTION 'Course term with id % does not exist', NEW.term_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_course_enrollment_trigger
  BEFORE INSERT OR UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION validate_course_enrollment();
```

### 3. Regular Data Integrity Checks
```sql
-- Query to find orphaned enrollments
SELECT 
  'Orphaned course references' as issue,
  COUNT(*) as count
FROM course_enrollments ce
LEFT JOIN courses c ON ce.course_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 
  'Orphaned term references' as issue,
  COUNT(*) as count
FROM course_enrollments ce
LEFT JOIN course_terms ct ON ce.term_id = ct.id
WHERE ce.term_id IS NOT NULL AND ct.id IS NULL;
```

## Next Steps

1. **Run the diagnostic scripts** to identify the specific issue
2. **Check the database data** using the SQL queries
3. **Apply the appropriate fix** based on the diagnosis
4. **Test the API call** to ensure it works
5. **Implement prevention measures** to avoid future issues

## Support

If issues persist after applying these fixes:

1. Run the diagnostic scripts and share the output
2. Check if all foreign key relationships are intact
3. Verify RLS policies are correctly configured
4. Ensure data types are consistent across tables
5. Check for any triggers that might affect the data 