#!/bin/bash

# Negavid Exercise Type Migration Script
# This script applies the negavid exercise type migration to the database

set -e

echo "🎥 Starting Negavid Exercise Type Migration..."

# Check if we're in the right directory
if [ ! -f "migrations/add_negavid_exercise_type.sql" ]; then
    echo "❌ Error: add_negavid_exercise_type.sql not found. Please run this script from the project root."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set."
    echo "Please set it to your database connection string."
    exit 1
fi

echo "📋 Applying negavid exercise type migration to database..."

# Apply the migration script
psql "$DATABASE_URL" -f migrations/add_negavid_exercise_type.sql

echo "✅ Negavid exercise type migration completed successfully!"

echo ""
echo "📋 Next steps:"
echo "1. Regenerate Supabase types:"
echo "   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts"
echo ""
echo "2. Test the application to ensure negavid exercise type works:"
echo "   npm run dev"
echo ""
echo "3. Verify the new exercise type is available in the exercise creation form"

echo ""
echo "🎯 Negavid exercise type has been successfully added to the application!"
