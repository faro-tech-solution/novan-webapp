#!/bin/bash

# Script to apply the migration for allowing NULL exercise_id in exercise_notes table
# This allows creating global notes that are not tied to any specific exercise

echo "🔄 Applying migration: Allow NULL exercise_id in exercise_notes table..."

# Check if we're in the right directory
if [ ! -f "migrations/allow_null_exercise_id_in_notes.sql" ]; then
    echo "❌ Error: Migration file not found. Please run this script from the project root directory."
    exit 1
fi

# Apply the migration
echo "📝 Executing SQL migration..."
psql $DATABASE_URL -f migrations/allow_null_exercise_id_in_notes.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "📋 Changes made:"
    echo "   - exercise_id column in exercise_notes table now allows NULL values"
    echo "   - This enables creating global notes not tied to specific exercises"
    echo ""
    echo "🎯 You can now create global notes from the /notes page!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi