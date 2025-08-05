#!/bin/bash

echo "🧹 Starting comprehensive cleanup of wiki functionality..."

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

# 1. Remove wiki-related pages
echo "📁 Removing wiki-related pages..."
rm -rf app/admin/wiki/
rm -rf app/trainer/wiki/
rm -rf app/trainee/*/wiki/
rm -f src/pages/wiki/Wiki.tsx
rm -f src/pages/wiki/WikiManagement.tsx
rm -f src/pages/wiki/WikiCategory.tsx
rm -f src/pages/wiki/WikiArticle.tsx
rm -f src/pages/wiki/CreateWikiArticle.tsx
print_status "Removed wiki pages"

# 2. Remove wiki-related hooks and services
echo "🔗 Removing wiki-related hooks and services..."
rm -f src/hooks/useWikiQuery.ts
print_status "Removed wiki hooks and services"

# 3. Remove wiki-related types
echo "📝 Removing wiki-related types..."
# We'll need to clean up the types file manually since it might contain other types

# 4. Remove wiki-related database migrations
echo "🗄️  Removing wiki-related database migrations..."
rm -f migrations/rls/04_wiki_rls.sql
print_status "Removed wiki RLS policies"

# 5. Clean up navigation references
echo "🧭 Cleaning up navigation references..."
# We'll need to manually update navigation files

# 6. Clean up dashboard references
echo "📊 Cleaning up dashboard references..."
# We'll need to manually update dashboard files

print_status "Wiki cleanup script completed!"
echo ""
echo "📋 Manual cleanup tasks remaining:"
echo "1. Update navigation files to remove wiki links"
echo "2. Update dashboard files to remove wiki references"
echo "3. Update App.tsx to remove wiki routes"
echo "4. Update translations to remove wiki references"
echo "5. Update database schema documentation"
echo "6. Remove wiki tables from database (if needed)"
echo ""
echo "⚠️  Note: Some files may need manual review and cleanup" 