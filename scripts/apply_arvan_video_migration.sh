#!/bin/bash
# Script to apply Arvan Video exercise type migration

echo "Starting Arvan Video exercise type migration..."

# Check if migration file exists
if [ ! -f "migrations/add_arvan_video_exercise_type.sql" ]; then
    echo "Error: Migration file not found!"
    exit 1
fi

# Apply the migration using supabase
echo "Applying migration..."
if command -v supabase &> /dev/null; then
    supabase db migrate up --file migrations/add_arvan_video_exercise_type.sql
    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
    else
        echo "❌ Migration failed!"
        exit 1
    fi
else
    echo "Warning: supabase CLI not found. Please apply the migration manually:"
    echo "Run the SQL commands in migrations/add_arvan_video_exercise_type.sql"
fi

echo "Arvan Video exercise type migration completed!"