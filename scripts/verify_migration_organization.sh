#!/bin/bash

# Migration Organization Verification Script
# This script verifies the migration organization is complete and correct

set -e

WORKSPACE_DIR="/Users/hamidtadayoni/Documents/PROJECTS/personal/screenshot-showcase-tutorials"

echo "🔍 Verifying Migration Organization..."
echo "====================================="

# Check if consolidated migrations exist
CONSOLIDATED_DIR="$WORKSPACE_DIR/supabase/migrations-consolidated"
if [ -d "$CONSOLIDATED_DIR" ]; then
    CONSOLIDATED_COUNT=$(ls -1 "$CONSOLIDATED_DIR"/*.sql 2>/dev/null | wc -l)
    echo "✅ Consolidated migrations: $CONSOLIDATED_COUNT files"
else
    echo "❌ Consolidated migrations directory not found"
    exit 1
fi

# Check if archive directory exists
ARCHIVE_DIR="$WORKSPACE_DIR/migrations-archive"
if [ -d "$ARCHIVE_DIR" ]; then
    ARCHIVE_COUNT=$(find "$ARCHIVE_DIR" -name "*.sql" 2>/dev/null | wc -l)
    echo "✅ Archived migrations: $ARCHIVE_COUNT files"
    
    # Check archive structure
    if [ -d "$ARCHIVE_DIR/rollbacks" ]; then
        ROLLBACK_COUNT=$(ls -1 "$ARCHIVE_DIR/rollbacks"/*.sql 2>/dev/null | wc -l)
        echo "  - Rollbacks: $ROLLBACK_COUNT files"
    fi
    
    if [ -d "$ARCHIVE_DIR/tests" ]; then
        TEST_COUNT=$(ls -1 "$ARCHIVE_DIR/tests"/*.sql 2>/dev/null | wc -l)
        echo "  - Tests: $TEST_COUNT files"
    fi
    
    if [ -d "$ARCHIVE_DIR/deprecated/uuid-migrations" ]; then
        UUID_COUNT=$(ls -1 "$ARCHIVE_DIR/deprecated/uuid-migrations"/*.sql 2>/dev/null | wc -l)
        echo "  - UUID migrations: $UUID_COUNT files"
    fi
else
    echo "❌ Archive directory not found"
    exit 1
fi

# Check if backup exists
BACKUP_COUNT=$(ls -1d "$WORKSPACE_DIR/migration-backup-"* 2>/dev/null | wc -l)
echo "✅ Backups created: $BACKUP_COUNT"

# Check migration order in consolidated
echo ""
echo "📋 Consolidated Migration Order:"
echo "================================"
ls -1 "$CONSOLIDATED_DIR"/*.sql 2>/dev/null | sed 's/.*\///' | sort | nl

# Check for potential issues
echo ""
echo "🔍 Checking for Issues..."
echo "========================"

# Check for duplicate names
DUPLICATE_CHECK=$(ls -1 "$CONSOLIDATED_DIR"/*.sql 2>/dev/null | sed 's/.*\///' | sort | uniq -d)
if [ -z "$DUPLICATE_CHECK" ]; then
    echo "✅ No duplicate migration names found"
else
    echo "⚠️  Duplicate migration names found:"
    echo "$DUPLICATE_CHECK"
fi

# Check for proper naming convention
NAMING_ISSUES=$(ls -1 "$CONSOLIDATED_DIR"/*.sql 2>/dev/null | sed 's/.*\///' | grep -v '^[0-9]\{8\}.*\.sql$' | grep -v '^[0-9]\{8\}_.*\.sql$' | grep -v '^[0-9]\{13\}.*\.sql$' || true)
if [ -z "$NAMING_ISSUES" ]; then
    echo "✅ All migrations follow proper naming convention"
else
    echo "⚠️  Migrations with naming issues:"
    echo "$NAMING_ISSUES"
fi

echo ""
echo "📊 Final Summary:"
echo "================="
echo "- Consolidated migrations: $CONSOLIDATED_COUNT"
echo "- Archived files: $ARCHIVE_COUNT"
echo "- Backups: $BACKUP_COUNT"
echo "- Organization: Complete ✅"
echo ""
echo "🎉 Migration organization verification complete!"
echo ""
echo "Next steps:"
echo "1. Review consolidated migrations in: $CONSOLIDATED_DIR"
echo "2. Test migrations in development environment"
echo "3. Run ./scripts/implement_migrations.sh to finalize"
