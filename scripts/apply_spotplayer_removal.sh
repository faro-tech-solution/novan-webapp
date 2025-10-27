#!/bin/bash

# Script to remove SpotPlayer exercise type from the database
# This script applies the migration to remove spotplayer from exercise_type constraint

set -e

echo "🗑️  Removing SpotPlayer exercise type from database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

echo "📊 Applying SpotPlayer removal migration..."

# Apply the migrations
echo "📊 Applying SpotPlayer exercise type removal..."
psql "$DATABASE_URL" -f migrations/remove_spotplayer_exercise_type.sql

echo "📊 Dropping SpotPlayer tables..."
psql "$DATABASE_URL" -f migrations/drop_spotplayer_tables.sql

echo "✅ SpotPlayer removal completed successfully!"
echo "The exercise_type constraint now allows: form, video, audio, simple, iframe"
echo "Existing spotplayer exercises have been converted to simple type"
echo "SpotPlayer metadata has been cleaned up from the exercises table"
echo "SpotPlayer tables have been dropped: spotplayer_stream_logs, spotplayer_licenses, spotplayer_cookies" 