#!/bin/bash

# Script to apply RLS policy for public instructor profiles
# This allows non-authenticated users to view instructor names on public course pages

echo "Applying public instructor profiles RLS policy..."

# Check if SUPABASE_DB_URL environment variable is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL environment variable is not set."
    echo "Please set it with your Supabase database URL:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
    exit 1
fi

# Apply the RLS policy migration
psql "$SUPABASE_DB_URL" -f migrations/rls/11_public_instructor_profiles.sql

if [ $? -eq 0 ]; then
    echo "✅ Public instructor profiles RLS policy applied successfully!"
    echo ""
    echo "The following policy was created:"
    echo "- Public can view instructor profiles (trainers and admins only)"
    echo ""
    echo "Anonymous users can now view instructor names on public course pages."
else
    echo "❌ Error applying RLS policy. Please check the error messages above."
    exit 1
fi

