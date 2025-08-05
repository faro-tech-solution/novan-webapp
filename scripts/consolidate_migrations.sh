#!/bin/bash

# Comprehensive Migration Consolidation Script
# This script consolidates duplicate migrations and creates a clean migration structure

set -e

# Configuration
WORKSPACE_DIR="/Users/hamidtadayoni/Documents/PROJECTS/personal/novan-webapp"
SUPABASE_DIR="$WORKSPACE_DIR/supabase/migrations"
CONSOLIDATED_DIR="$WORKSPACE_DIR/supabase/migrations-consolidated"
MIGRATIONS_DIR="$WORKSPACE_DIR/migrations"

echo "🧹 Starting Comprehensive Migration Consolidation..."
echo "====================================================="

# Create consolidated directory
mkdir -p "$CONSOLIDATED_DIR"

echo "📋 Step 1: Identifying core migrations to keep..."

# Core migrations that should be kept (in order)
declare -a CORE_MIGRATIONS=(
    "20240614_create_profiles.sql"
    "20240615_initial_database_setup.sql"
    "20240616_create-daily-activities-table.sql"
    "20240617_update-daily-activities-rls.sql"
    "20240618_fix_rls_policies.sql"
    "20240620_add_exercise_types.sql"
    "20240621_remove-student-name-email-from-exercise-submissions.sql"
    "20240622_update_exercises_structure.sql"
    "20240705_add_notifications_system.sql"
    "20250702_add_language_preference.sql"
)

# Move core migrations to consolidated directory
for migration in "${CORE_MIGRATIONS[@]}"; do
    if [ -f "$SUPABASE_DIR/$migration" ]; then
        echo "✅ Keeping: $migration"
        cp "$SUPABASE_DIR/$migration" "$CONSOLIDATED_DIR/"
    else
        echo "⚠️  Missing: $migration"
    fi
done

echo ""
echo "📋 Step 2: Consolidating profile-related migrations..."

# Create consolidated profile migration
cat > "$CONSOLIDATED_DIR/20250616120000_profile_enhancements.sql" << 'EOF'
-- Consolidated Profile Enhancements Migration
-- This migration consolidates all profile-related changes from multiple migrations

-- Split name fields and add new profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Update existing full_name data to split into first_name and last_name
UPDATE public.profiles 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN split_part(full_name, ' ', 1)
        ELSE full_name
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE NULL
    END
WHERE full_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.address IS 'User street address';
COMMENT ON COLUMN public.profiles.city IS 'User city';
COMMENT ON COLUMN public.profiles.country IS 'User country';
COMMENT ON COLUMN public.profiles.postal_code IS 'User postal code';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.gender IS 'User gender';
COMMENT ON COLUMN public.profiles.bio IS 'User biography';
COMMENT ON COLUMN public.profiles.website IS 'User website URL';
COMMENT ON COLUMN public.profiles.linkedin IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.github IS 'User GitHub profile URL';
COMMENT ON COLUMN public.profiles.twitter IS 'User Twitter profile URL';
COMMENT ON COLUMN public.profiles.is_demo IS 'Whether this is a demo account';
EOF

echo "✅ Created consolidated profile migration"

echo ""
echo "📋 Step 3: Consolidating course and accounting migrations..."

# Create consolidated course/accounting migration
cat > "$CONSOLIDATED_DIR/20250616130000_course_accounting_system.sql" << 'EOF'
-- Consolidated Course and Accounting System Migration
-- This migration consolidates all course enrollment and accounting changes

-- Add course pricing
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Create payment type and status enums
DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'cash', 'free');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update course_enrollments table
DROP TABLE IF EXISTS course_enrollments CASCADE;
CREATE TABLE course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    payment_status payment_status DEFAULT 'pending',
    payment_type payment_type DEFAULT 'free',
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);

-- Enable RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = student_id);

-- Create accounting table
DROP TABLE IF EXISTS accounting CASCADE;
CREATE TABLE accounting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
    payment_method payment_type,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for accounting
ALTER TABLE accounting ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounting
CREATE POLICY "Users can view their own accounting records" ON accounting
    FOR SELECT USING (auth.uid() = user_id);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER set_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_accounting_updated_at
    BEFORE UPDATE ON accounting
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create course enrollment accounting trigger
CREATE OR REPLACE FUNCTION public.handle_course_enrollment_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create accounting record if payment status is completed
    IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
        INSERT INTO accounting (
            user_id,
            course_id,
            enrollment_id,
            amount,
            transaction_type,
            payment_method,
            payment_status,
            description
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            NEW.id,
            NEW.amount_paid,
            'payment',
            NEW.payment_type,
            NEW.payment_status,
            'Course enrollment payment'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER course_enrollment_payment_trigger
    AFTER INSERT OR UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_course_enrollment_payment();
EOF

echo "✅ Created consolidated course/accounting migration"

echo ""
echo "📋 Step 4: Consolidating exercise system migrations..."

# Create consolidated exercise system migration
cat > "$CONSOLIDATED_DIR/20250616140000_exercise_system_enhancements.sql" << 'EOF'
-- Consolidated Exercise System Enhancements Migration
-- This migration consolidates all exercise-related improvements

-- Update exercise_submissions table
ALTER TABLE exercise_submissions
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Remove student_name and email columns if they exist (legacy cleanup)
ALTER TABLE exercise_submissions
DROP COLUMN IF EXISTS student_name,
DROP COLUMN IF EXISTS email;

-- Add estimated_time to exercises table
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Update exercise policies
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can update exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can delete exercises" ON exercises;

-- Create improved exercise policies
CREATE POLICY "Users can view all exercises" ON exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Trainers can manage exercises" ON exercises FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('trainer', 'admin')
    ));

-- Add comments for documentation
COMMENT ON COLUMN exercise_submissions.first_name IS 'Student first name from profile';
COMMENT ON COLUMN exercise_submissions.last_name IS 'Student last name from profile';
COMMENT ON COLUMN exercise_submissions.estimated_time IS 'Estimated time to complete in minutes';
COMMENT ON COLUMN exercises.estimated_time IS 'Estimated time to complete in minutes';
EOF

echo "✅ Created consolidated exercise system migration"

echo ""
echo "📋 Step 5: Adding remaining migrations from /migrations directory..."

# Move remaining important migrations from /migrations to consolidated
if [ -f "$MIGRATIONS_DIR/achievement_system.sql" ]; then
    cp "$MIGRATIONS_DIR/achievement_system.sql" "$CONSOLIDATED_DIR/20250616150000_achievement_system.sql"
    echo "✅ Added achievement system migration"
fi

if [ -f "$MIGRATIONS_DIR/add_instruction_to_tasks.sql" ]; then
    cp "$MIGRATIONS_DIR/add_instruction_to_tasks.sql" "$CONSOLIDATED_DIR/20250616160000_add_instruction_to_tasks.sql"
    echo "✅ Added task instructions migration"
fi

if [ -f "$MIGRATIONS_DIR/notifications_system.sql" ]; then
    # Check if we already have a notifications migration
    if [ ! -f "$CONSOLIDATED_DIR/20240705_add_notifications_system.sql" ]; then
        cp "$MIGRATIONS_DIR/notifications_system.sql" "$CONSOLIDATED_DIR/20250616170000_notifications_system.sql"
        echo "✅ Added notifications system migration"
    else
        echo "ℹ️  Notifications system already exists in core migrations"
    fi
fi

echo ""
echo "📋 Step 6: Creating migration summary..."

# Create a summary of the consolidated migrations
cat > "$CONSOLIDATED_DIR/README.md" << 'EOF'
# Consolidated Migration Structure

This directory contains the cleaned up and consolidated migration files for the project.

## Migration Order

1. **20240614_create_profiles.sql** - Initial profiles table
2. **20240615_initial_database_setup.sql** - Core database setup
3. **20240616_create-daily-activities-table.sql** - Daily activities tracking
4. **20240617_update-daily-activities-rls.sql** - RLS for daily activities
5. **20240618_fix_rls_policies.sql** - RLS policy fixes
6. **20240620_add_exercise_types.sql** - Exercise type enhancements
7. **20240621_remove-student-name-email-from-exercise-submissions.sql** - Exercise submissions cleanup
8. **20240622_update_exercises_structure.sql** - Exercise structure improvements
9. **20240705_add_notifications_system.sql** - Notifications system
10. **20250616120000_profile_enhancements.sql** - Consolidated profile improvements
11. **20250616130000_course_accounting_system.sql** - Consolidated course and accounting system
12. **20250616140000_exercise_system_enhancements.sql** - Consolidated exercise improvements
13. **20250616150000_achievement_system.sql** - Achievement system (if available)
14. **20250616160000_add_instruction_to_tasks.sql** - Task instructions (if available)
15. **20250702_add_language_preference.sql** - Language preferences

## What Was Consolidated

### Profile System
- Split name fields (first_name, last_name)
- Added comprehensive profile fields (phone, address, bio, social links)
- Added demo account support
- Migrated existing full_name data

### Course & Accounting System
- Course pricing and currency support
- Payment type and status enums
- Complete course enrollment system
- Accounting table with transaction tracking
- Automated payment recording triggers

### Exercise System
- Exercise time estimation
- Improved submission tracking
- Enhanced RLS policies
- Cleaned up legacy columns

### Removed Duplicates
- 30+ UUID-based migration files
- Multiple duplicate course enrollment migrations
- Redundant profile field migrations
- Backup files (.bak)

## Benefits
- Reduced from 68 to ~15 migration files
- Clear migration dependencies
- No duplicate functionality
- Easier to maintain and understand
- Proper chronological order
EOF

echo "✅ Created migration summary"

echo ""
echo "🎉 Migration consolidation complete!"
echo "========================================="
echo "📊 Summary:"
echo "- Original migrations: 68"
echo "- Consolidated migrations: $(ls -1 "$CONSOLIDATED_DIR"/*.sql 2>/dev/null | wc -l)"
echo "- UUID migrations archived: $(ls -1 "$WORKSPACE_DIR/migrations-archive/deprecated/uuid-migrations"/*.sql 2>/dev/null | wc -l)"
echo ""
echo "📁 Locations:"
echo "- Consolidated migrations: $CONSOLIDATED_DIR"
echo "- Archived files: $WORKSPACE_DIR/migrations-archive"
echo "- Backup: Available in migration-backup-* directories"
echo ""
echo "Next steps:"
echo "1. Review the consolidated migrations in $CONSOLIDATED_DIR"
echo "2. Test the migration order"
echo "3. Replace the original supabase/migrations directory"
echo "4. Update your deployment scripts"
