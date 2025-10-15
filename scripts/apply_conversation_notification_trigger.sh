#!/bin/bash

# Script to apply conversation notification trigger migration
# This script adds a trigger to create notifications when trainer/admin responds to exercises

set -e

echo "==================================="
echo "Applying Conversation Notification Trigger Migration"
echo "==================================="

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Migration file
MIGRATION_FILE="$PROJECT_ROOT/migrations/add_conversation_notification_trigger.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

# Source environment variables
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    source "$PROJECT_ROOT/.env.local"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set"
    exit 1
fi

echo "📊 Applying migration..."
echo "Migration file: $MIGRATION_FILE"

# Apply the migration using psql or supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db execute --file "$MIGRATION_FILE"
elif command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    echo "Using psql..."
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
else
    echo "⚠️  Warning: Neither supabase CLI nor psql with DATABASE_URL is available."
    echo "📝 Please apply the migration manually:"
    echo "   1. Go to your Supabase dashboard"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Copy and paste the contents of: $MIGRATION_FILE"
    echo "   4. Execute the SQL"
    exit 0
fi

echo "✅ Migration applied successfully!"
echo ""
echo "📋 Summary:"
echo "   - Created function: create_conversation_notification()"
echo "   - Created trigger: trigger_conversation_notification"
echo "   - Notifications will now be sent when trainer/admin responds to exercises"
echo ""
echo "==================================="

