#!/bin/bash

# Script to apply iframe exercise type and iframe_html column migrations
# This script adds support for iframe-based exercises with full HTML code

set -e

echo "🚀 Applying iframe exercise type and iframe_html column migrations..."

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
echo "📦 Applying iframe exercise type migration..."
supabase db push --include-all

echo "✅ Migrations applied successfully!"
echo ""
echo "🎉 Iframe exercise type with full HTML support has been added to the system."
echo "   You can now create exercises with type 'iframe' that embed external content using full HTML code."
echo ""
echo "📝 Next steps:"
echo "   1. Create a new exercise and select 'iframe' as the exercise type"
echo "   2. Enter the full HTML code (including style and div tags) in the iframe_html field"
echo "   3. Students will be able to view the embedded content and complete the exercise"
echo ""
echo "💡 Example HTML code:"
echo "   <style>.r1_iframe_embed {position: relative; overflow: hidden; width: 100%; height: auto; padding-top: 56.25%; } .r1_iframe_embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }</style><div class=\"r1_iframe_embed\"><iframe src=\"https://player.arvancloud.ir/index.html?config=https://novan.arvanvod.ir/waV5ZLBklg/vDOWJgjqBL/origin_config.json\" style=\"border:0 #ffffff none;\" name=\"00-001.mp4\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowFullScreen=\"true\" webkitallowfullscreen=\"true\" mozallowfullscreen=\"true\"></iframe></div>" 