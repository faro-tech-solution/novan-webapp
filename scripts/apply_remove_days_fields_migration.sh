#!/bin/bash

# Apply Remove Days Fields Migration
# ===================================

echo "Applying migration to remove all date fields from exercises table..."

# Set the database URL from environment variable
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Apply the migration
echo "Running remove days fields migration..."
psql "$DATABASE_URL" -f migrations/remove_days_to_fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Remove days fields migration applied successfully!"
    echo ""
    echo "Migration includes:"
    echo "- Removed all date-related columns: days_to_open, days_to_due, days_to_close"
    echo "- Removed additional date columns: open_date, due_date, close_date"  
    echo "- Exercises now have no date constraints - they are always available"
    echo ""
    echo "Next steps:"
    echo "1. Update your Supabase types: npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/database.types.ts"
    echo "2. Test the application functionality"
    echo "3. All exercises are now always available without date restrictions"
else
    echo "❌ Error applying remove days fields migration"
    exit 1
fi