#!/bin/bash

# Fix Exercise Order Calculation Bug
# ==================================
# 
# This script fixes the bug where exercises in category 4 start with order_index 1, 2, 3...
# instead of 4001, 4002, 4003... when category order changes.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Exercise Order Calculation Bug${NC}"
echo "=============================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set your database connection string:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo -e "${YELLOW}📋 Before applying fix, let's check current state...${NC}"

# Check current exercise order_indexes for categories
echo -e "${BLUE}Current exercise order_indexes by category:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    ec.id as category_id,
    ec.name as category_name,
    ec.order_index as category_order,
    COUNT(e.id) as exercise_count,
    MIN(e.order_index) as min_exercise_order,
    MAX(e.order_index) as max_exercise_order
FROM exercise_categories ec
LEFT JOIN exercises e ON e.category_id = ec.id
GROUP BY ec.id, ec.name, ec.order_index
ORDER BY ec.order_index;
"

echo ""
echo -e "${YELLOW}🔍 Sample exercises showing the bug (if any):${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    e.id,
    e.title,
    ec.name as category_name,
    ec.order_index as category_order,
    e.order_index,
    (e.order_index % 1000) as exercise_order_in_category,
    (ec.order_index * 1000) as expected_base_order
FROM exercises e
JOIN exercise_categories ec ON ec.id = e.category_id
WHERE e.order_index < (ec.order_index * 1000)
ORDER BY ec.order_index, e.order_index
LIMIT 10;
"

echo ""
echo -e "${GREEN}✅ Applying the fix...${NC}"

# Apply the fix
psql "$DATABASE_URL" -f migrations/fix_exercise_order_calculation_bug.sql

echo ""
echo -e "${YELLOW}📋 After applying fix, let's verify the results...${NC}"

# Check exercise order_indexes after fix
echo -e "${BLUE}Exercise order_indexes after fix:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    ec.id as category_id,
    ec.name as category_name,
    ec.order_index as category_order,
    COUNT(e.id) as exercise_count,
    MIN(e.order_index) as min_exercise_order,
    MAX(e.order_index) as max_exercise_order
FROM exercise_categories ec
LEFT JOIN exercises e ON e.category_id = ec.id
GROUP BY ec.id, ec.name, ec.order_index
ORDER BY ec.order_index;
"

echo ""
echo -e "${BLUE}Sample exercises after fix:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    e.id,
    e.title,
    ec.name as category_name,
    ec.order_index as category_order,
    e.order_index,
    (e.order_index % 1000) as exercise_order_in_category,
    (ec.order_index * 1000) as expected_base_order
FROM exercises e
JOIN exercise_categories ec ON ec.id = e.category_id
ORDER BY ec.order_index, e.order_index
LIMIT 15;
"

echo ""
echo -e "${GREEN}✅ Fix applied successfully!${NC}"
echo ""
echo -e "${BLUE}📝 What was fixed:${NC}"
echo "• Exercises now preserve their relative order within categories when category order changes"
echo "• Category 4 exercises will now correctly start with order_index 4001, 4002, 4003, etc."
echo "• The bug where exercises were reordered based on created_at timestamp is resolved"
echo ""
echo -e "${YELLOW}⚠️  Note: If you have existing exercises with incorrect order_indexes,${NC}"
echo -e "${YELLOW}   you may need to run the recalculate_all_exercise_order_indexes_after_reorder()${NC}"
echo -e "${YELLOW}   function to fix all exercises at once.${NC}"
