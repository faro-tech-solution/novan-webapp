#!/bin/bash

# Create Sample Exercise Categories
# =================================

echo "Creating sample exercise categories..."

# Set the database URL from environment variable
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run the sample categories creation script
echo "Running sample categories creation..."
psql "$DATABASE_URL" -f scripts/create_sample_categories.sql

if [ $? -eq 0 ]; then
    echo "✅ Sample exercise categories created successfully!"
    echo ""
    echo "Created categories:"
    echo "- تمرینات پایه (Basic Exercises)"
    echo "- تمرینات پیشرفته (Advanced Exercises)"
    echo "- تمرینات عملی (Practical Exercises)"
    echo ""
    echo "You can now test the categorized view in the admin/trainer dashboard."
else
    echo "❌ Error creating sample exercise categories"
    exit 1
fi 