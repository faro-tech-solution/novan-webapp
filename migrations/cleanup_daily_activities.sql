-- Cleanup Daily Activities System
-- This script removes all daily activities related tables and data

-- Drop daily activities table
DROP TABLE IF EXISTS daily_activities CASCADE;

-- Remove any daily activities related RLS policies (if they exist)
DROP POLICY IF EXISTS "Users can view daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can manage daily activities" ON daily_activities;

-- Remove any daily activities related triggers (if they exist)
DROP TRIGGER IF EXISTS set_updated_at ON daily_activities;
DROP TRIGGER IF EXISTS update_daily_activities_updated_at ON daily_activities;

-- Clean up any daily activities related functions (if they exist)
DROP FUNCTION IF EXISTS get_daily_activities_stats() CASCADE;
DROP FUNCTION IF EXISTS get_daily_activities_for_user(UUID) CASCADE;

-- Note: This script should be run carefully as it permanently removes all daily activities data
-- Make sure to backup any important data before running this script 