#!/bin/bash

# Apply SpotPlayer exercise type migration
# ======================================

echo "Applying SpotPlayer exercise type migration..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Apply the migration
echo "Running migration to add 'spotplayer' to exercise_type constraint..."
psql "$DATABASE_URL" -f migrations/add_spotplayer_exercise_type.sql

if [ $? -eq 0 ]; then
    echo "✅ Successfully applied SpotPlayer exercise type migration"
    echo "The exercise_type constraint now allows: 'form', 'video', 'audio', 'simple', 'spotplayer'"
else
    echo "❌ Failed to apply migration"
    exit 1
fi 