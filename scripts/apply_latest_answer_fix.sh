#!/bin/bash

# Script to apply the latest_answer constraint fix
echo "Applying latest_answer constraint fix..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your database connection string"
    exit 1
fi

# Apply the migration
echo "Running migration to fix latest_answer constraint..."
psql "$DATABASE_URL" -f migrations/fix_latest_answer_constraint.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully"
    echo "✅ The constraint error should now be resolved"
    echo "✅ Users should be able to complete exercises successfully"
else
    echo "❌ Migration failed"
    echo "Please check the error messages above"
    exit 1
fi 