#!/bin/bash

# Run the achievement function enhancement migration
echo "Running achievement function enhancement migration..."

# Use the same connection details as in migrate.sh
source .env 2>/dev/null || true

# If SUPABASE_URL and SUPABASE_KEY are not set, try to get them from supabase/config.toml
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
  if [ -f "supabase/config.toml" ]; then
    echo "Getting connection details from supabase/config.toml..."
    SUPABASE_URL=$(grep -A 3 "\[api\]" supabase/config.toml | grep "url" | cut -d'"' -f2)
    SUPABASE_KEY=$(grep -A 3 "\[api\]" supabase/config.toml | grep "service_role_key" | cut -d'"' -f2)
  fi
fi

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
  echo "Error: SUPABASE_URL and SUPABASE_KEY must be set in .env or supabase/config.toml"
  exit 1
fi

# Extract the database connection parameters from Supabase URL
PGHOST=$(echo $SUPABASE_URL | sed -e 's|^https\?://||' -e 's|/.*$||' -e 's|:[0-9]\+$||')
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=$SUPABASE_KEY

export PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD

echo "Running migration: enhance_achievement_function.sql"
psql -f migrations/enhance_achievement_function.sql

echo "Achievement function enhancement migration completed."
