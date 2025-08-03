#!/bin/bash

echo "🧹 Starting comprehensive cleanup of group functionality..."

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

# 1. Remove group-related pages
echo "📁 Removing group-related pages..."
rm -f app/admin/group-management/page.tsx
rm -f src/pages/management/GroupManagement.tsx
print_status "Removed group management pages"

# 2. Remove group-related components
echo "🧩 Removing group-related components..."
rm -f src/components/dialogs/CreateGroupDialog.tsx
rm -f src/components/dialogs/EditGroupDialog.tsx
rm -f src/components/dialogs/GroupDetailsDialog.tsx
rm -f src/components/dialogs/ConfirmDeleteGroupDialog.tsx
print_status "Removed group dialog components"

# 3. Remove group-related hooks and services
echo "🔗 Removing group-related hooks and services..."
rm -f src/hooks/queries/useGroupsQuery.ts
rm -f src/services/groupService.ts
print_status "Removed group hooks and services"

# 4. Remove group-related types
echo "📝 Removing group-related types..."
# We'll need to clean up the types file manually since it might contain other types

# 5. Remove group-related database migrations
echo "🗄️  Removing group-related database migrations..."
rm -f migrations/rls/06_groups_rls.sql
print_status "Removed group RLS policies"

# 6. Clean up navigation references
echo "🧭 Cleaning up navigation references..."
# We'll need to manually update navigation files

# 7. Clean up dashboard references
echo "📊 Cleaning up dashboard references..."
# We'll need to manually update dashboard files

print_status "Group cleanup script completed!"
echo ""
echo "📋 Manual cleanup tasks remaining:"
echo "1. Update src/types/group.ts (remove or clean up)"
echo "2. Update navigation files to remove group links"
echo "3. Update dashboard files to remove group references"
echo "4. Update database schema documentation"
echo "5. Remove group tables from database (if needed)"
echo ""
echo "⚠️  Note: Some files may need manual review and cleanup" 