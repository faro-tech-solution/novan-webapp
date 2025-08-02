-- 06_groups_rls.sql
-- Consolidated RLS policies for Groups system
-- Tables: groups, group_members, group_courses

-- ========================================
-- GROUPS TABLE RLS POLICIES
-- ========================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
DROP POLICY IF EXISTS "Admins can insert groups" ON groups;
DROP POLICY IF EXISTS "Admins can update groups" ON groups;
DROP POLICY IF EXISTS "Admins can view all groups" ON groups;

-- Users can view groups (needed for dashboards)
CREATE POLICY "Users can view groups" ON groups
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Admins can manage groups
CREATE POLICY "Admins can manage groups" ON groups
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- GROUP_MEMBERS TABLE RLS POLICIES
-- ========================================
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;
DROP POLICY IF EXISTS "Public can view group members" ON group_members;
DROP POLICY IF EXISTS "Admins can delete group members" ON group_members;
DROP POLICY IF EXISTS "Admins can insert group members" ON group_members;
DROP POLICY IF EXISTS "Admins can view all group members" ON group_members;

-- Users can view their group memberships
CREATE POLICY "Users can view their group memberships" ON group_members
FOR SELECT USING (
  user_id = auth.uid()
);

-- Admins can manage group members
CREATE POLICY "Admins can manage group members" ON group_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Public can view group members (for dashboards)
CREATE POLICY "Public can view group members" ON group_members
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- GROUP_COURSES TABLE RLS POLICIES
-- ========================================
ALTER TABLE group_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can delete group courses" ON group_courses;
DROP POLICY IF EXISTS "Admins can insert group courses" ON group_courses;
DROP POLICY IF EXISTS "Admins can view all group courses" ON group_courses;

-- Admins can manage group courses
CREATE POLICY "Admins can delete group courses" ON group_courses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
CREATE POLICY "Admins can insert group courses" ON group_courses
FOR INSERT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
CREATE POLICY "Admins can view all group courses" ON group_courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
); 