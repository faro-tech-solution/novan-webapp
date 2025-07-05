#!/bin/bash

# Migration Cleanup Script
# This script helps organize and clean up migration files

set -e

WORKSPACE_DIR="/Users/hamidtadayoni/Documents/PROJECTS/personal/screenshot-showcase-tutorials"
SUPABASE_MIGRATIONS_DIR="$WORKSPACE_DIR/supabase/migrations"
OLD_MIGRATIONS_DIR="$WORKSPACE_DIR/migrations"
ARCHIVE_DIR="$WORKSPACE_DIR/migrations-archive"

echo "🧹 Starting Migration Cleanup Process..."
echo "==========================================="

# Create backup of current state
echo "📦 Creating backup of current state..."
BACKUP_DIR="$WORKSPACE_DIR/migration-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$SUPABASE_MIGRATIONS_DIR" "$BACKUP_DIR/supabase-migrations"
cp -r "$OLD_MIGRATIONS_DIR" "$BACKUP_DIR/old-migrations"
echo "✅ Backup created at: $BACKUP_DIR"

# Move test files to archive
echo "🔬 Moving test files to archive..."
mv "$OLD_MIGRATIONS_DIR/check_"*.sql "$ARCHIVE_DIR/tests/" 2>/dev/null || true
mv "$OLD_MIGRATIONS_DIR/test_"*.sql "$ARCHIVE_DIR/tests/" 2>/dev/null || true
mv "$OLD_MIGRATIONS_DIR/verify_"*.sql "$ARCHIVE_DIR/tests/" 2>/dev/null || true

# Move rollback files to archive
echo "↩️ Moving rollback files to archive..."
mv "$OLD_MIGRATIONS_DIR/rollback_"*.sql "$ARCHIVE_DIR/rollbacks/" 2>/dev/null || true

# Move development files to archive
echo "🛠️ Moving development files to archive..."
mv "$OLD_MIGRATIONS_DIR/manual_migration_instructions.md" "$ARCHIVE_DIR/development/" 2>/dev/null || true
mv "$OLD_MIGRATIONS_DIR/README.md" "$ARCHIVE_DIR/development/" 2>/dev/null || true

# Move archive folder to deprecated
echo "📁 Moving archive folder to deprecated..."
mv "$OLD_MIGRATIONS_DIR/archive" "$ARCHIVE_DIR/deprecated/" 2>/dev/null || true

echo "✅ Migration cleanup phase 1 complete!"
echo "📁 Files organized in: $ARCHIVE_DIR"
echo "💾 Backup available at: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Review the organized files in migrations-archive/"
echo "2. Run the consolidation script to merge duplicate migrations"
echo "3. Test the new migration structure"
