# Course Terms Database Cleanup

This document outlines the complete cleanup process for removing all course terms related database objects from the Novan webapp.

## Overview

The cleanup process removes:
- `course_terms` table
- `teacher_term_assignments` table  
- `term_id` column from `course_enrollments` table
- All related RLS policies, triggers, and indexes
- All foreign key constraints

## What This Means

After cleanup:
- Students will be enrolled directly into courses (no term-based organization)
- Teachers will only have course-level assignments (no term-specific assignments)
- The application will work with a simplified course enrollment system

## Files Created

### 1. `scripts/cleanup_course_terms_database.sql`
Main cleanup script that removes:
- Foreign key constraints
- Database tables
- Indexes and triggers

### 2. `scripts/cleanup_course_terms_rls.sql`
Removes all RLS policies related to course terms.

### 3. `scripts/cleanup_course_terms_migrations.sql`
Updates database schema and verifies cleanup.

### 4. `scripts/cleanup_course_terms_complete.sh`
Main shell script that runs all cleanup operations in the correct order.

## How to Run the Cleanup

### Prerequisites
- PostgreSQL client (`psql`) installed
- Access to the database
- Database backup (recommended for production)

### Option 1: Run the Complete Script (Recommended)
```bash
# From the project root directory
./scripts/cleanup_course_terms_complete.sh
```

The script will:
1. Ask for confirmation
2. Clean up RLS policies
3. Remove database objects
4. Update schema references
5. Verify cleanup completion

### Option 2: Run Individual Scripts
```bash
# 1. Clean up RLS policies first
psql -h localhost -U postgres -d your_database -f scripts/cleanup_course_terms_rls.sql

# 2. Remove database objects
psql -h localhost -U postgres -d your_database -f scripts/cleanup_course_terms_database.sql

# 3. Update schema references
psql -h localhost -U postgres -d your_database -f scripts/cleanup_course_terms_migrations.sql
```

### Environment Variables
You can customize database connection parameters:
```bash
export DB_HOST="your_host"
export DB_PORT="5432"
export DB_NAME="your_database"
export DB_USER="your_user"
./scripts/cleanup_course_terms_complete.sh
```

## What Gets Removed

### Tables
- `course_terms` - Course term definitions
- `teacher_term_assignments` - Teacher assignments to specific terms

### Columns
- `term_id` from `course_enrollments` table

### Constraints
- Foreign key constraints referencing course_terms
- Unique constraints on teacher-term assignments

### Indexes
- `idx_course_enrollments_term_id`
- `idx_course_terms_course_id`

### Triggers
- `set_updated_at` trigger on course_terms table

### RLS Policies
- All policies for course_terms table
- All policies for teacher_term_assignments table

## Verification

After running the cleanup, you can verify completion:

```sql
-- Check if tables still exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('course_terms', 'teacher_term_assignments');

-- Check if term_id column still exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' AND column_name = 'term_id';

-- Check for remaining foreign key references
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name IN ('course_terms', 'teacher_term_assignments');
```

## Post-Cleanup Actions

1. **Restart Application**: Restart your web application to ensure it picks up the new schema
2. **Update Application Code**: Ensure your application code doesn't reference removed tables/columns
3. **Test Functionality**: Verify that course enrollments and teacher assignments still work correctly
4. **Update Documentation**: Update any database documentation or schemas

## Rollback (If Needed)

If you need to rollback the changes:
1. Restore from your database backup
2. Re-run any migrations that create the course_terms tables
3. Re-apply RLS policies

## Warnings

⚠️ **This operation is irreversible!** Make sure you have a backup before proceeding.

⚠️ **Production Impact**: This will affect any existing data in the course_terms tables.

⚠️ **Application Compatibility**: Ensure your application code is compatible with the new schema.

## Support

If you encounter issues during the cleanup process:
1. Check the PostgreSQL logs for error messages
2. Verify database connection parameters
3. Ensure you have sufficient privileges to modify the database schema
4. Consider restoring from backup if the cleanup fails partway through

## Summary

This cleanup process completely removes the course terms system from the database, simplifying the course enrollment structure. Students will now be enrolled directly into courses without term-based organization, and teachers will have course-level assignments only.
