#!/bin/bash

# Script to apply Q&A moderation features migration
# This script adds moderation capabilities to the exercise_questions table

set -e

echo "🚀 Applying Q&A Moderation Features Migration..."
echo "=============================================="

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

echo "📋 Migration Details:"
echo "- Adds moderation_status field (pending, approved, rejected, flagged)"
echo "- Adds admin fields: is_pinned, is_resolved, admin_notes"
echo "- Adds moderation tracking: moderated_by, moderated_at"
echo "- Adds reply_count field for better performance"
echo "- Creates moderation function and triggers"
echo "- Updates existing reply counts"
echo ""

# Apply the migration
echo "🔄 Applying migration..."
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < migrations/add_qa_moderation_features.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎉 Q&A Moderation Features Added:"
    echo "- ✅ Moderation status tracking"
    echo "- ✅ Admin pinning/resolving capabilities"
    echo "- ✅ Admin notes for moderation decisions"
    echo "- ✅ Automatic reply count updates"
    echo "- ✅ Performance optimizations with indexes"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Update TypeScript types in src/types/exerciseQA.ts"
    echo "2. Update service functions in src/services/exerciseQAService.ts"
    echo "3. Test the moderation features in the admin panel"
else
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi