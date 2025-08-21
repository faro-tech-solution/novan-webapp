#!/bin/bash

# =====================================================
# COURSE TERMS COMPLETE CLEANUP SCRIPT
# This script runs all cleanup operations for course terms
# =====================================================

set -e  # Exit on any error

echo "🚀 Starting Course Terms Database Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "scripts/cleanup_course_terms_database.sql" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Database connection parameters (you may need to adjust these)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}

print_status "Database connection parameters:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Ask for confirmation
read -p "Are you sure you want to proceed with removing ALL course terms related database objects? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_warning "Operation cancelled by user"
    exit 0
fi

print_status "Starting cleanup process..."

# Step 0: Check what actually exists first
print_status "Step 0: Checking what course terms objects exist..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/check_course_terms_existence.sql

echo ""
read -p "Review the output above. Do you want to continue with the cleanup? (yes/no): " continue_cleanup

if [ "$continue_cleanup" != "yes" ]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

# Step 1: Clean up RLS policies first
print_status "Step 1: Cleaning up RLS policies..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/cleanup_course_terms_rls.sql

# Step 2: Clean up database objects
print_status "Step 2: Cleaning up database objects..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/cleanup_course_terms_database.sql

# Step 3: Clean up migration references
print_status "Step 3: Cleaning up migration references..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/cleanup_course_terms_migrations.sql

print_status "✅ Course terms database cleanup completed successfully!"

# Final verification
print_status "Running final verification..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'Remaining Objects' as status,
    COUNT(*) as count
FROM (
    SELECT 'course_terms' as table_name
    FROM information_schema.tables 
    WHERE table_name = 'course_terms'
    UNION ALL
    SELECT 'teacher_term_assignments' as table_name
    FROM information_schema.tables 
    WHERE table_name = 'teacher_term_assignments'
    UNION ALL
    SELECT 'term_id column' as table_name
    FROM information_schema.columns 
    WHERE table_name = 'course_enrollments' AND column_name = 'term_id'
) as remaining_objects;
"

print_status "🎉 Cleanup process completed!"
print_warning "Note: You may need to restart your application after this cleanup"
print_warning "Note: Consider running a full database backup before applying these changes in production"
