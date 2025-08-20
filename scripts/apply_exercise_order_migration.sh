#!/bin/bash

# Apply Exercise Order Index Migration
# ===================================

echo "Applying exercise order_index migration..."

# Set the database URL from environment variable
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Apply the main migration
echo "Running exercise order_index migration..."
psql "$DATABASE_URL" -f migrations/add_order_index_to_exercises.sql

if [ $? -eq 0 ]; then
    echo "✅ Exercise order_index migration applied successfully!"
else
    echo "❌ Error applying exercise order_index migration"
    exit 1
fi

# Apply the category change trigger migration
echo "Running category change trigger migration..."
psql "$DATABASE_URL" -f migrations/update_exercise_order_on_category_change.sql

if [ $? -eq 0 ]; then
    echo "✅ Category change trigger migration applied successfully!"
else
    echo "❌ Error applying category change trigger migration"
    exit 1
fi

echo ""
echo "Migration completed successfully!"
echo ""
echo "Migration includes:"
echo "- Added order_index column to exercises table"
echo "- Created function to calculate order_index based on category order and exercise order within category"
echo "- Created trigger to automatically calculate order_index on exercise insert/update"
echo "- Created function to recalculate all order_indexes"
echo "- Created trigger to update exercise order_index when category order changes"
echo "- Updated existing exercises with calculated order_index"
echo "- Created index for better performance on sorting"
echo ""
echo "Next steps:"
echo "1. Update your Supabase types if needed"
echo "2. Test the exercise numbering functionality"
echo "3. Verify that exercises display with numbers like '1. Exercise Title'"
