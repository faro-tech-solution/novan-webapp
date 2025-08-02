#!/bin/bash

# Apply Notification Redirect URL and Translation Key Updates
# ==========================================================
# This script updates the notification creation functions to use the correct redirect URLs
# and translation keys instead of hardcoded English text

set -e

echo "🔄 Applying notification redirect URL and translation key updates..."

# Check if we're in the right directory
if [ ! -f "migrations/update_notification_redirects.sql" ]; then
    echo "❌ Error: migrations/update_notification_redirects.sql not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Apply the migration
echo "📝 Applying notification redirect and translation updates..."
psql "$DATABASE_URL" -f migrations/update_notification_redirects.sql

echo "✅ Notification redirect URLs and translation keys updated successfully!"
echo ""
echo "📋 Changes applied:"
echo "- award_achieved notifications now redirect to /progress"
echo "- exercise_feedback notifications now redirect to /exercise/{exercise_id}"
echo "- All notification titles and descriptions now use translation keys"
echo ""
echo "🎯 Next steps:"
echo "1. Test notification clicks to ensure they redirect to the correct pages"
echo "2. Verify that new notifications use the updated URLs and translation keys"
echo "3. Check that existing notifications still work properly"
echo "4. Test language switching to ensure translations work correctly" 