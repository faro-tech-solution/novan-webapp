#!/bin/bash

# Update Achievement System with Persian Award Names
# This script applies the updated achievement system with Persian award names

echo "Applying achievement system with Persian award names..."

# Path to the Supabase CLI (update this if needed)
SUPABASE_CLI="supabase"

# Check if supabase CLI is available
if ! command -v $SUPABASE_CLI &> /dev/null; then
    echo "Error: Supabase CLI not found. Please make sure it's installed."
    exit 1
fi

# First, check the Persian award names
echo "Checking Persian award names in the database..."
$SUPABASE_CLI db execute --file ./migrations/check_persian_awards.sql

# Apply the updated achievement system
echo "Applying updated achievement system..."
$SUPABASE_CLI db execute --file ./migrations/achievement_system.sql

echo "Achievement system updated successfully!"
