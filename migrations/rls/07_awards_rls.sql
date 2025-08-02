-- 07_awards_rls.sql
-- Consolidated RLS policies for Awards system
-- Tables: awards, student_awards

-- ========================================
-- AWARDS TABLE RLS POLICIES
-- ========================================
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view awards" ON awards;
DROP POLICY IF EXISTS "Admins can manage awards" ON awards;
DROP POLICY IF EXISTS "Everyone can view awards" ON awards;

-- Users can view awards (needed for dashboards)
CREATE POLICY "Users can view awards" ON awards
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Admins can manage awards
CREATE POLICY "Admins can manage awards" ON awards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- STUDENT_AWARDS TABLE RLS POLICIES
-- ========================================
ALTER TABLE student_awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their awards" ON student_awards;
DROP POLICY IF EXISTS "Admins can view all awards" ON student_awards;
DROP POLICY IF EXISTS "Trainers can view student awards" ON student_awards;
DROP POLICY IF EXISTS "Public can view student awards" ON student_awards;
DROP POLICY IF EXISTS "Students can view their own awards" ON student_awards;

-- Students can view their own awards
CREATE POLICY "Students can view their awards" ON student_awards
FOR SELECT USING (
  student_id = auth.uid()
);

-- Admins can view all awards
CREATE POLICY "Admins can view all awards" ON student_awards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Trainers can view student awards
CREATE POLICY "Trainers can view student awards" ON student_awards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'trainer'
  )
);

-- Public can view student awards (for dashboards)
CREATE POLICY "Public can view student awards" ON student_awards
FOR SELECT USING (
  auth.role() = 'authenticated'
); 