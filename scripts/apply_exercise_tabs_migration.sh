#!/bin/bash

# Script to apply exercise tabs features migration
# This script adds Q&A, votes, and notes functionality to exercises

set -e

echo "🚀 Applying Exercise Tabs Features Migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed. Please install it first."
    echo "   Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Apply the migrations
echo "📦 Applying exercise tabs features migration..."
supabase db push --include-all

echo "✅ Migration applied successfully!"
echo ""
echo "🎉 Exercise tabs features have been added to the system."
echo ""
echo "📝 What was added:"
echo "   - Exercise Q&A system with questions and answers"
echo "   - Vote system (upvote/downvote)"
echo "   - Private notes for each user per exercise"
echo ""
echo "📋 Next steps:"
echo "   1. The tabs will appear for trainees on exercise detail pages"
echo "   2. Q&A tab is disabled for iframe and simple exercises"
echo "   3. Admins and trainers can manage Q&A from their portals"
echo ""