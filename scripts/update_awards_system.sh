#!/bin/bash

# Update Awards System with code-based identifiers
# This script applies the awards system update with code-based identifiers
# and removes name/description columns in favor of client-side translations

echo "Updating awards system with code-based identifiers and client-side translations..."

# Check for PostgreSQL access methods
if command -v psql &> /dev/null; then
    # Use psql if available
    echo "Using psql for database operations..."
    DB_COMMAND="psql -U postgres -d postgres -f"
    HAS_DB_ACCESS=true
elif command -v supabase &> /dev/null; then
    # Try to use the correct Supabase CLI format
    echo "Using Supabase CLI for database operations..."
    SUPABASE_VERSION=$(supabase --version | head -n 1 | cut -d ' ' -f 3)
    echo "Detected Supabase CLI version: $SUPABASE_VERSION"
    
    # For newer versions, use 'db execute' pattern
    if supabase db execute --help | grep -q "\-\-file"; then
        DB_COMMAND="supabase db execute --file"
        HAS_DB_ACCESS=true
    # For older versions try SQL command
    elif supabase sql --help &> /dev/null; then
        DB_COMMAND="supabase sql -f"
        HAS_DB_ACCESS=true
    else
        echo "Warning: Unable to determine correct Supabase CLI command. Will try multiple formats."
        HAS_DB_ACCESS=false
    fi
else
    echo "Error: Neither psql nor Supabase CLI found. Please install one of them."
    exit 1
fi

# Function to execute SQL file with appropriate command
execute_sql_file() {
    local file=$1
    echo "Executing $file..."
    
    if [ "$HAS_DB_ACCESS" = true ]; then
        $DB_COMMAND $file
        return $?
    else
        # Try multiple formats if we couldn't determine the correct one
        supabase db execute --file $file 2>/dev/null || \
        supabase sql -f $file 2>/dev/null || \
        supabase db push --file $file 2>/dev/null || \
        echo "Error: Failed to execute SQL file. Please check your Supabase CLI version."
        return $?
    fi
}

# Step 1: Apply the migration to add award codes and remove name/description
echo "Adding unique code identifiers to awards table and removing name/description columns..."
execute_sql_file "./migrations/add_award_codes.sql"

# Step 2: Update any views or functions that might depend on removed columns
echo "Updating dependent views and functions..."
execute_sql_file "./migrations/update_award_dependencies.sql"

# Step 3: Check the awards table to verify the migration
echo "Checking award codes in the database..."
execute_sql_file "./migrations/check_awards_table.sql"

# Step 4: Run verification script to confirm migration was successful
echo "Verifying migration success..."
execute_sql_file "./migrations/verify_award_migration.sql"

echo "Awards system update completed!"
echo "IMPORTANT: The awards table no longer contains name and description columns."
echo "All award names and descriptions should now be retrieved from the TypeScript translations file:"
echo "  src/translations/awardTranslations.ts"
echo ""
echo "See AwardBadge.tsx and awardTranslationUtils.ts for examples of how to use the translation system."
