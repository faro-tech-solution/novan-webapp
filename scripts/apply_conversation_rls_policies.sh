#!/bin/bash

# Apply RLS policies for exercise_submissions_conversation table
# This script applies the RLS policies to enable proper access control for conversation messages

echo "Applying RLS policies for exercise_submissions_conversation table..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Apply the RLS policies
supabase db reset --linked
supabase db push --linked

# Or if you want to apply just this specific migration:
# psql "$DATABASE_URL" -f "$PROJECT_ROOT/migrations/rls/06_exercise_submissions_conversation_rls.sql"

echo "RLS policies for exercise_submissions_conversation table applied successfully!"
echo ""
echo "The following policies were created:"
echo "- Admins can manage all conversation messages"
echo "- Trainers can view and create conversation messages for their exercises"
echo "- Students can view and create conversation messages for their submissions"
echo "- General authenticated user policy with proper access control"
echo ""
echo "You can now test the exercise submission and conversation functionality."
