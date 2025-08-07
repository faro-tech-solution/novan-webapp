#!/bin/bash

# Apply Course Enrollments RLS Fix
# This script fixes the infinite recursion issue in course_enrollments RLS policies

set -e

echo "🔧 Applying Course Enrollments RLS Fix..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "export DATABASE_URL='your_database_connection_string'"
    exit 1
fi

echo "📋 Step 1: Applying the RLS fix..."
echo ""

# Apply the fix
psql "$DATABASE_URL" -f migrations/rls/fix_course_enrollments_infinite_recursion.sql

echo ""
echo "✅ Course Enrollments RLS fix applied successfully!"
echo ""
echo "🔍 The fix includes:"
echo "   - Simplified RLS policies to avoid infinite recursion"
echo "   - Removed complex joins that were causing circular references"
echo "   - Separated concerns between different user roles"
echo ""
echo "🧪 To test the fix, try adding a student to a course again."
echo "   The infinite recursion error should be resolved."
echo ""
echo "📝 If you still encounter issues, check the logs for any remaining errors." 