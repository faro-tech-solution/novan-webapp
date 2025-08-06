#!/bin/bash

# Apply metadata migration to exercises table
echo "Applying metadata migration to exercises table..."

# Check if we're in the right directory
if [ ! -f "migrations/add_metadata_to_exercises.sql" ]; then
    echo "Error: Migration file not found. Please run this script from the project root."
    exit 1
fi

# Apply the migration using psql (assuming you have psql installed and configured)
# You may need to adjust the connection parameters based on your setup
psql -h localhost -U postgres -d postgres -f migrations/add_metadata_to_exercises.sql

echo "✅ Metadata migration applied successfully!"
echo "The exercises table now has a metadata field for storing exercise-specific configuration." 