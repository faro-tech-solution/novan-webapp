#!/bin/bash

# Apply sort column migration to exercises table
# =============================================

echo "Applying sort column migration to exercises table..."

# Check if we're in the right directory
if [ ! -f "migrations/add_sort_column_to_exercises.sql" ]; then
    echo "Error: Migration file not found. Please run this script from the project root."
    exit 1
fi

# Apply the migration
echo "Running migration: add_sort_column_to_exercises.sql"
psql $DATABASE_URL -f migrations/add_sort_column_to_exercises.sql

if [ $? -eq 0 ]; then
    echo "✅ Sort column migration applied successfully!"
    echo ""
    echo "Migration details:"
    echo "- Added 'sort' column to exercises table with default value 0"
    echo "- Created index on sort column for better performance"
    echo "- Created composite index on (sort ASC, created_at ASC) for optimal sorting"
    echo ""
    echo "Exercises will now be sorted by:"
    echo "1. sort column (lowest to highest)"
    echo "2. created_at (ascending) when sort values are equal or 0"
else
    echo "❌ Error applying migration"
    exit 1
fi 