#!/bin/bash

# Ticket System Cleanup Script
# This script applies the ticket system cleanup to the database

set -e

echo "🧹 Starting Ticket System Cleanup..."

# Check if we're in the right directory
if [ ! -f "migrations/cleanup_tickets.sql" ]; then
    echo "❌ Error: cleanup_tickets.sql not found. Please run this script from the project root."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set."
    echo "Please set it to your database connection string."
    exit 1
fi

echo "📋 Applying ticket system cleanup to database..."

# Apply the cleanup script
psql "$DATABASE_URL" -f migrations/cleanup_tickets.sql

echo "✅ Ticket system cleanup completed successfully!"

echo ""
echo "📋 Next steps:"
echo "1. Regenerate Supabase types:"
echo "   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts"
echo ""
echo "2. Test the application to ensure no ticket-related errors:"
echo "   npm run dev"
echo ""
echo "3. Verify cleanup by checking for any remaining ticket references:"
echo "   grep -r 'ticket' src/ --exclude-dir=node_modules"

echo ""
echo "🎯 Ticket system has been completely removed from the application!"
