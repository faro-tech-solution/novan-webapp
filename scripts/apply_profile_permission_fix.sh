#!/bin/bash
# Script to apply the profile permission fix for trainers

echo "Applying profile permission fix for trainers..."

# Change to project directory if needed
cd "$(dirname "$0")/.."

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
  echo "Error: Supabase CLI not found. Please install it first."
  exit 1
fi

# Apply the migration
echo "Running SQL migration..."
cat migrations/fix_trainer_access_to_profiles.sql | PGPASSWORD="$DB_PASSWORD" psql "$DATABASE_URL" -f -

# Check the result
if [ $? -eq 0 ]; then
  echo "✅ Permission fix applied successfully"
else
  echo "❌ Failed to apply permission fix"
  exit 1
fi

echo "Done!"
