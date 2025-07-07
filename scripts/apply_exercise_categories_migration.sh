#!/bin/bash

# Apply Exercise Categories Migration
# ===================================

echo "Applying exercise categories migration..."

# Set the database URL from environment variable
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Apply the migration
echo "Running exercise categories migration..."
psql "$DATABASE_URL" -f migrations/exercise_categories.sql

if [ $? -eq 0 ]; then
    echo "✅ Exercise categories migration applied successfully!"
    echo ""
    echo "Migration includes:"
    echo "- Created exercise_categories table"
    echo "- Added category_id column to exercises table"
    echo "- Created indexes for performance"
    echo "- Applied RLS policies for security"
    echo "- Added triggers for updated_at timestamps"
    echo ""
    echo "Next steps:"
    echo "1. Update your Supabase types if needed"
    echo "2. Test the exercise categories functionality"
    echo "3. Create some categories for your courses"
else
    echo "❌ Error applying exercise categories migration"
    exit 1
fi 