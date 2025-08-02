-- Dashboard RLS Policies
-- This migration creates RLS policies for all tables needed by admin and trainer dashboards
-- to ensure proper access control while allowing dashboard functionality

-- ========================================
-- PROFILES TABLE RLS POLICIES
-- ========================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and Trainers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- ========================================
-- PROFILES TABLE - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can view all profiles
CREATE POLICY "Admins and Trainers can view all profiles" ON profiles
FOR SELECT USING (
  auth.role() = 'admin' OR auth.role() = 'trainer'
);

-- ========================================
-- PROFILES TABLE - TRAINERS RLS POLICIES
-- ========================================




-- ========================================
-- PROFILES TABLE - GENERAL RLS POLICIES
-- ========================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id
);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- Note: Role-based access control (admin/trainer permissions) should be handled
-- at the application level or through separate role-based policies that don't
-- create circular references. The above policies provide basic security while
-- avoiding infinite recursion issues.
