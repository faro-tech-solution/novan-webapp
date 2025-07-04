#!/bin/bash
# Simple script to run the SQL migration directly

# Prompt for database connection string
read -p "Enter your database URL: " DB_URL
read -sp "Enter database password: " DB_PASSWORD
echo ""

echo "Running migration..."
cat migrations/fix_trainer_access_to_profiles.sql | PGPASSWORD="$DB_PASSWORD" psql "$DB_URL" -f -

if [ $? -eq 0 ]; then
  echo "✅ Permission fix applied successfully"
else
  echo "❌ Failed to apply permission fix"
  exit 1
fi
