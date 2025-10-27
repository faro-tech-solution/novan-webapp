#!/bin/bash

# Script to apply the title field migration to exercise_questions table
# This script adds a mandatory title field to Q&A questions

echo "Applying title field migration to exercise_questions table..."

# Check if we're in the right directory
if [ ! -f "migrations/add_title_to_exercise_questions.sql" ]; then
    echo "Error: Migration file not found. Please run this script from the project root."
    exit 1
fi

# Apply the migration
echo "Executing migration..."
psql -h localhost -p 5432 -U postgres -d novan_webapp -f migrations/add_title_to_exercise_questions.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "✅ Title field added to exercise_questions table"
    echo "✅ Existing questions updated with content-based titles"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
