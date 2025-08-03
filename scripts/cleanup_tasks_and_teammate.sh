#!/bin/bash

echo "🧹 Starting comprehensive cleanup of tasks functionality and teammate dashboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Remove task-related pages
echo "📁 Removing task-related pages..."
rm -f app/admin/tasks-management/page.tsx
rm -f src/pages/management/TasksManagement.tsx
print_status "Removed task management pages"

# 2. Remove teammate-related pages
echo "👥 Removing teammate-related pages..."
rm -rf app/teammate/
rm -f src/pages/dashboard/TeammatesDashboard.tsx
rm -f src/pages/shared/TeammateTasks.tsx
print_status "Removed teammate pages and dashboard"

# 3. Remove task-related components
echo "🧩 Removing task-related components..."
rm -f src/components/dashboard/DailyTasksCard.tsx
print_status "Removed task dashboard components"

# 4. Remove task-related database migrations
echo "🗄️  Removing task-related database migrations..."
rm -f migrations/rls/05_tasks_rls.sql
print_status "Removed task RLS policies"

# 5. Clean up navigation references
echo "🧭 Cleaning up navigation references..."
# We'll need to manually update navigation files

# 6. Clean up dashboard references
echo "📊 Cleaning up dashboard references..."
# We'll need to manually update dashboard files

print_status "Tasks and teammate cleanup script completed!"
echo ""
echo "📋 Manual cleanup tasks remaining:"
echo "1. Update navigation files to remove task and teammate links"
echo "2. Update dashboard files to remove task and teammate references"
echo "3. Update App.tsx to remove teammate routes"
echo "4. Update AuthContext to remove teammate role"
echo "5. Update database schema documentation"
echo "6. Remove task and teammate tables from database (if needed)"
echo ""
echo "⚠️  Note: Some files may need manual review and cleanup" 