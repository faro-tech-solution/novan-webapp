-- 09_notifications_rls.sql
-- Consolidated RLS policies for Notifications system
-- Tables: notifications

-- ========================================
-- NOTIFICATIONS TABLE RLS POLICIES
-- ========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System functions can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
FOR SELECT USING (
  receiver_id = auth.uid()
);

-- System functions can create notifications
CREATE POLICY "System functions can create notifications" ON notifications
FOR INSERT WITH CHECK (
  sender_id IS NULL OR sender_id = auth.uid()
);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (
  receiver_id = auth.uid()
); 