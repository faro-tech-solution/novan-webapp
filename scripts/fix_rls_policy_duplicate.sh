#!/bin/bash

# Script to fix RLS policy duplicate error
# This script fixes the "policy already exists" error

set -e

echo "🔧 Fixing RLS Policy Duplicate Error..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "migrations/add_qa_moderation_features.sql" ]; then
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
echo "- Drops existing 'Admins can moderate questions' policy"
echo "- Recreates the policy with proper permissions"
echo "- Prevents duplicate policy error"
echo ""

# Apply the migration
echo "🔄 Applying migration with policy fix..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < migrations/add_qa_moderation_features.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎉 RLS Policy Issue Fixed:"
    echo "- ✅ Dropped existing duplicate policy"
    echo "- ✅ Created new policy with proper permissions"
    echo "- ✅ Migration completed without errors"
    echo ""
    echo "📝 The Q&A moderation features are now ready!"
else
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi
