# Migration Files Organization Plan

## Current Issues

1. **Duplicate Migration Files**: Many UUID-based migrations in `/supabase/migrations` that appear to be duplicates
2. **Two Migration Directories**: `/migrations` and `/supabase/migrations` with overlapping content
3. **Archive Files**: Old/unused files in `/migrations/archive/`
4. **Test Files**: Test and check files mixed with actual migrations
5. **Rollback Files**: Scattered rollback files without clear organization

## New Organization Structure

### Primary Migration Directory: `/supabase/migrations`

This will be the single source of truth for all migrations, following Supabase's naming convention.

### Secondary Directory: `/migrations-archive`

For development/testing files, rollbacks, and documentation.

## Proposed Structure

```
/supabase/migrations/
├── 20240614120000_initial_setup.sql
├── 20240615120000_profiles_and_auth.sql
├── 20240616120000_exercises_and_submissions.sql
├── 20240617120000_daily_activities.sql
├── 20240618120000_tasks_and_subtasks.sql
├── 20240619120000_course_system.sql
├── 20240620120000_accounting_system.sql
├── 20240621120000_notifications_system.sql
├── 20240622120000_awards_and_achievements.sql
├── 20240623120000_wiki_and_groups.sql
└── 20240624120000_language_preferences.sql

/migrations-archive/
├── rollbacks/
│   ├── rollback_accounting_system.sql
│   ├── rollback_awards_system.sql
│   └── rollback_notifications_system.sql
├── tests/
│   ├── test_awards_system.sql
│   ├── test_notifications.sql
│   └── check_persian_awards.sql
├── development/
│   ├── manual_migration_instructions.md
│   └── README.md
└── deprecated/
    ├── old_uuid_migrations/
    └── archive/
```

## Migration Categories

### 1. Core System Migrations (Keep & Consolidate)

- **Initial Setup**: Database schema, basic tables
- **Profiles & Auth**: User profiles, authentication
- **Exercises & Submissions**: Core learning functionality
- **Daily Activities**: Activity tracking
- **Tasks & Subtasks**: Task management system
- **Course System**: Course enrollment, pricing
- **Accounting System**: Payment tracking
- **Notifications System**: Notification functionality
- **Awards & Achievements**: Achievement system
- **Wiki & Groups**: Wiki and group features
- **Language Preferences**: Localization

### 2. Files to Archive

- Test files (check\_\*.sql)
- Rollback files (rollback\_\*.sql)
- Manual instructions (\*.md)
- UUID-based duplicate migrations
- Old archive files

### 3. Files to Remove

- Backup files (\*.sql.bak)
- Duplicate migrations
- Test migrations that are no longer needed
- Old archived files that serve no purpose

## Implementation Steps

1. **Backup Current State**
2. **Create New Structure**
3. **Consolidate Core Migrations**
4. **Move Development Files to Archive**
5. **Remove Duplicates and Obsolete Files**
6. **Update Documentation**
7. **Test Migration Order**

## Benefits

- **Single Source of Truth**: All active migrations in one place
- **Clear Organization**: Logical grouping and naming
- **Easier Maintenance**: Reduced confusion and duplication
- **Better Version Control**: Cleaner git history
- **Improved Deployment**: Predictable migration order
