-- Cleanup Groups System
-- This script removes all group-related tables and data

-- Drop group-related tables in the correct order (due to foreign key constraints)
DROP TABLE IF EXISTS group_courses CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Remove any group-related RLS policies (if they still exist)
DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;
DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;
DROP POLICY IF EXISTS "Public can view group members" ON group_members;

-- Remove any group-related triggers (if they exist)
DROP TRIGGER IF EXISTS set_updated_at ON groups;
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;

-- Clean up any group-related functions (if they exist)
DROP FUNCTION IF EXISTS get_group_stats() CASCADE;
DROP FUNCTION IF EXISTS get_group_with_details(UUID) CASCADE;

-- Note: This script should be run carefully as it permanently removes all group data
-- Make sure to backup any important data before running this script 