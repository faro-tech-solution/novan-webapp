#!/bin/bash

# Script to fix moderate_question function ambiguous column reference
# This script fixes the PostgreSQL function error

set -e

echo "🔧 Fixing moderate_question function..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "migrations/fix_moderate_question_function.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found!"
    echo "Please install Supabase CLI: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not connected to Supabase!"
    echo "Please run: supabase login"
    exit 1
fi

echo "📋 Fix Details:"
echo "- Fixes ambiguous column reference 'admin_notes'"
echo "- Properly references function parameter vs table column"
echo "- Recreates the moderate_question function"
echo ""

# Apply the migration
echo "🔄 Applying fix..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < migrations/fix_moderate_question_function.sql

if [ $? -eq 0 ]; then
    echo "✅ Function fix applied successfully!"
    echo ""
    echo "🎉 moderate_question Function Fixed:"
    echo "- ✅ Resolved ambiguous column reference"
    echo "- ✅ Proper parameter scoping"
    echo "- ✅ Function recreated successfully"
    echo ""
    echo "📝 The moderation features should now work correctly!"
else
    echo "❌ Fix failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi
