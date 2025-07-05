#!/bin/bash

# Migration Analysis Script
# This script analyzes the supabase migrations to identify duplicates and consolidation opportunities

set -e

SUPABASE_DIR="/Users/hamidtadayoni/Documents/PROJECTS/personal/screenshot-showcase-tutorials/supabase/migrations"
ANALYSIS_FILE="/Users/hamidtadayoni/Documents/PROJECTS/personal/screenshot-showcase-tutorials/migration_analysis.txt"

echo "🔍 Analyzing Supabase migrations for duplicates and consolidation opportunities..."
echo "=================================================================================="

# Create analysis file
echo "Migration Analysis Report" > "$ANALYSIS_FILE"
echo "Generated: $(date)" >> "$ANALYSIS_FILE"
echo "=========================" >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

# Count total migrations
total_migrations=$(ls -1 "$SUPABASE_DIR"/*.sql | wc -l)
echo "Total migrations found: $total_migrations" | tee -a "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

# Group migrations by date
echo "Migrations by date:" >> "$ANALYSIS_FILE"
echo "==================" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | sed 's/.*\///' | cut -d'_' -f1 | sort | uniq -c | sort -nr >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

# Find UUID-based migrations (likely duplicates)
echo "UUID-based migrations (potential duplicates):" >> "$ANALYSIS_FILE"
echo "=============================================" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | grep -E '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | sed 's/.*\///' >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

# Find .bak files
echo "Backup files (.bak):" >> "$ANALYSIS_FILE"
echo "===================" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.bak 2>/dev/null | sed 's/.*\///' >> "$ANALYSIS_FILE" || echo "No backup files found" >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

# Group by functionality
echo "Migrations by functionality:" >> "$ANALYSIS_FILE"
echo "============================" >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

echo "Profile-related:" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | grep -i profile | sed 's/.*\///' >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

echo "Course-related:" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | grep -i course | sed 's/.*\///' >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

echo "Exercise-related:" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | grep -i exercise | sed 's/.*\///' >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

echo "Notification-related:" >> "$ANALYSIS_FILE"
ls -1 "$SUPABASE_DIR"/*.sql | grep -i notification | sed 's/.*\///' >> "$ANALYSIS_FILE"
echo "" >> "$ANALYSIS_FILE"

echo "✅ Analysis complete! Check $ANALYSIS_FILE for details"
echo ""
echo "Summary:"
echo "- Total migrations: $total_migrations"
echo "- UUID-based (potential duplicates): $(ls -1 "$SUPABASE_DIR"/*.sql | grep -E '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | wc -l)"
echo "- Backup files: $(ls -1 "$SUPABASE_DIR"/*.bak 2>/dev/null | wc -l || echo "0")"
