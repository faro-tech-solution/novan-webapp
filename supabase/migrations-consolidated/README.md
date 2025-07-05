# Consolidated Migration Structure

This directory contains the cleaned up and consolidated migration files for the project.

## Migration Order

1. **20240614_create_profiles.sql** - Initial profiles table
2. **20240615_initial_database_setup.sql** - Core database setup
3. **20240616_create-daily-activities-table.sql** - Daily activities tracking
4. **20240617_update-daily-activities-rls.sql** - RLS for daily activities
5. **20240618_fix_rls_policies.sql** - RLS policy fixes
6. **20240620_add_exercise_types.sql** - Exercise type enhancements
7. **20240621_remove-student-name-email-from-exercise-submissions.sql** - Exercise submissions cleanup
8. **20240622_update_exercises_structure.sql** - Exercise structure improvements
9. **20240705_add_notifications_system.sql** - Notifications system
10. **20250616120000_profile_enhancements.sql** - Consolidated profile improvements
11. **20250616130000_course_accounting_system.sql** - Consolidated course and accounting system
12. **20250616140000_exercise_system_enhancements.sql** - Consolidated exercise improvements
13. **20250616150000_achievement_system.sql** - Achievement system (if available)
14. **20250616160000_add_instruction_to_tasks.sql** - Task instructions (if available)
15. **20250702_add_language_preference.sql** - Language preferences

## What Was Consolidated

### Profile System
- Split name fields (first_name, last_name)
- Added comprehensive profile fields (phone, address, bio, social links)
- Added demo account support
- Migrated existing full_name data

### Course & Accounting System
- Course pricing and currency support
- Payment type and status enums
- Complete course enrollment system
- Accounting table with transaction tracking
- Automated payment recording triggers

### Exercise System
- Exercise time estimation
- Improved submission tracking
- Enhanced RLS policies
- Cleaned up legacy columns

### Removed Duplicates
- 30+ UUID-based migration files
- Multiple duplicate course enrollment migrations
- Redundant profile field migrations
- Backup files (.bak)

## Benefits
- Reduced from 68 to ~15 migration files
- Clear migration dependencies
- No duplicate functionality
- Easier to maintain and understand
- Proper chronological order
