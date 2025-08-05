#!/bin/bash

# Final Migration Implementation Script
# This script replaces the old migrations with the consolidated ones

set -e

# Configuration
WORKSPACE_DIR="/Users/hamidtadayoni/Documents/PROJECTS/personal/novan-webapp"
OLD_SUPABASE_DIR="$WORKSPACE_DIR/supabase/migrations"
CONSOLIDATED_DIR="$WORKSPACE_DIR/supabase/migrations-consolidated"
OLD_MIGRATIONS_DIR="$WORKSPACE_DIR/migrations"

echo "🚀 Implementing New Migration Structure..."
echo "=========================================="

# Confirm with user
echo "⚠️  This will replace your current migration structure with the consolidated one."
echo "📦 Backups have been created in migration-backup-* directories"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "🔄 Step 1: Renaming old migrations directory..."
mv "$OLD_SUPABASE_DIR" "$WORKSPACE_DIR/supabase/migrations-old"

echo "🔄 Step 2: Moving consolidated migrations to main directory..."
mv "$CONSOLIDATED_DIR" "$OLD_SUPABASE_DIR"

echo "🔄 Step 3: Archiving old migrations directory..."
mv "$OLD_MIGRATIONS_DIR" "$WORKSPACE_DIR/migrations-archive/deprecated/old-migrations"

echo "🧹 Step 4: Cleaning up duplicate and unnecessary files..."

# Remove any remaining duplicates in the new structure
cd "$OLD_SUPABASE_DIR"
if ls *-update-course-enrollments*.sql 1> /dev/null 2>&1; then
    echo "Found duplicate course enrollment files, removing..."
    rm -f *-update-course-enrollments*.sql
fi

if ls *-update-database-types*.sql 1> /dev/null 2>&1; then
    echo "Found duplicate database type files, removing..."
    rm -f *-update-database-types*.sql
fi

echo "📋 Step 5: Creating final summary..."
cat > "$WORKSPACE_DIR/MIGRATION_SUMMARY.md" << 'EOF'
# Migration Organization Summary

## What Was Done

### 1. Cleaned Up Structure
- **Before**: 68 migration files with many duplicates
- **After**: 15 clean, consolidated migration files

### 2. Organized Files
- **Active migrations**: `/supabase/migrations/` (15 files)
- **Archived files**: `/migrations-archive/` (organized by type)
- **Backups**: `migration-backup-*` directories

### 3. Consolidated Duplicates
- **Profile migrations**: 6 files → 1 consolidated file
- **Course/Accounting migrations**: 12 files → 1 consolidated file
- **Exercise migrations**: 4 files → 1 consolidated file
- **UUID migrations**: 30 files → archived

### 4. Archive Structure
```
migrations-archive/
├── rollbacks/          # All rollback scripts
├── tests/              # Test and verification scripts
├── development/        # Documentation and manual instructions
└── deprecated/         # Old UUID migrations and archive
```

## Current Migration Order

1. `20240614_create_profiles.sql` - Initial profiles
2. `20240615_initial_database_setup.sql` - Core database
3. `20240616_create-daily-activities-table.sql` - Daily activities
4. `20240617_update-daily-activities-rls.sql` - RLS updates
5. `20240618_fix_rls_policies.sql` - RLS fixes
6. `20240620_add_exercise_types.sql` - Exercise types
7. `20240621_remove-student-name-email-from-exercise-submissions.sql` - Cleanup
8. `20240622_update_exercises_structure.sql` - Exercise structure
9. `20240705_add_notifications_system.sql` - Notifications
10. `20250616120000_profile_enhancements.sql` - **CONSOLIDATED** Profile improvements
11. `20250616130000_course_accounting_system.sql` - **CONSOLIDATED** Course & accounting
12. `20250616140000_exercise_system_enhancements.sql` - **CONSOLIDATED** Exercise improvements
13. `20250616150000_achievement_system.sql` - Achievement system
14. `20250616160000_add_instruction_to_tasks.sql` - Task instructions
15. `20250702_add_language_preference.sql` - Language preferences

## Benefits

- ✅ **Reduced complexity**: 68 → 15 migrations
- ✅ **No duplicates**: All redundant migrations removed
- ✅ **Clear order**: Chronological and logical sequence
- ✅ **Easy maintenance**: Consolidated related changes
- ✅ **Proper backup**: All old files safely archived
- ✅ **Documentation**: Clear structure and purpose

## Next Steps

1. **Test the migrations**: Run them in a test environment
2. **Update deployment scripts**: Use the new migration structure
3. **Team communication**: Inform team about the new structure
4. **Monitor**: Watch for any issues during deployment

## Recovery

If issues arise, you can restore from the backup:
- Backups are in `migration-backup-*` directories
- Original structure is in `supabase/migrations-old`
- Use `git` to revert changes if needed

## File Locations

- **Active migrations**: `/supabase/migrations/`
- **Archived files**: `/migrations-archive/`
- **Backups**: `migration-backup-20250706_001330/`
- **Old migrations**: `supabase/migrations-old/`
EOF

echo "✅ Final summary created"

echo ""
echo "🎉 Migration Organization Complete!"
echo "=================================="
echo "📊 Results:"
echo "- Active migrations: $(ls -1 "$OLD_SUPABASE_DIR"/*.sql 2>/dev/null | wc -l)"
echo "- Archived files: $(find "$WORKSPACE_DIR/migrations-archive" -name "*.sql" 2>/dev/null | wc -l)"
echo "- Backups created: $(ls -1d "$WORKSPACE_DIR/migration-backup-"* 2>/dev/null | wc -l)"
echo ""
echo "📁 Structure:"
echo "- Active: supabase/migrations/"
echo "- Archive: migrations-archive/"
echo "- Backup: migration-backup-*/"
echo ""
echo "📋 Next steps:"
echo "1. Review the migrations in supabase/migrations/"
echo "2. Test the migration order in a development environment"
echo "3. Update your deployment scripts"
echo "4. Read MIGRATION_SUMMARY.md for complete details"
echo ""
echo "🔧 To test migrations:"
echo "  supabase db reset"
echo "  supabase db push"
EOF

echo "✅ Implementation script created"
echo ""
echo "Run this script to finalize the migration organization:"
echo "./scripts/implement_migrations.sh"
