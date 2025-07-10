-- 10_accounting_rls.sql
-- Consolidated RLS policies for Accounting system
-- Tables: accounting

-- ========================================
-- ACCOUNTING TABLE RLS POLICIES
-- ========================================
ALTER TABLE accounting ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their accounting" ON accounting;
DROP POLICY IF EXISTS "Admins can view all accounting" ON accounting;
DROP POLICY IF EXISTS "Public can view accounting" ON accounting;
DROP POLICY IF EXISTS "Admins can view all accounting records" ON accounting;
DROP POLICY IF EXISTS "Users can view their own accounting records" ON accounting;

-- Users can view their own accounting records
CREATE POLICY "Users can view their accounting" ON accounting
FOR SELECT USING (
  user_id = auth.uid()
);

-- Admins can view all accounting records
CREATE POLICY "Admins can view all accounting" ON accounting
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Public can view accounting (for dashboards)
CREATE POLICY "Public can view accounting" ON accounting
FOR SELECT USING (
  auth.role() = 'authenticated'
); 