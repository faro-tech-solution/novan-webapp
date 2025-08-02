-- 08_activities_logs_rls.sql
-- Consolidated RLS policies for Activities and Logs system
-- Tables: daily_activities, student_activity_logs

-- ========================================
-- DAILY_ACTIVITIES TABLE RLS POLICIES
-- ========================================
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can manage daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can delete daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can insert daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Admins can update daily activities" ON daily_activities;
DROP POLICY IF EXISTS "Everyone can view daily activities" ON daily_activities;

-- Users can view daily activities (needed for dashboards)
CREATE POLICY "Users can view daily activities" ON daily_activities
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Admins can manage daily activities
CREATE POLICY "Admins can manage daily activities" ON daily_activities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- STUDENT_ACTIVITY_LOGS TABLE RLS POLICIES
-- ========================================
ALTER TABLE student_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can insert their own activity logs" ON student_activity_logs;
DROP POLICY IF EXISTS "Students can view their own activity logs" ON student_activity_logs;

-- Students can insert their own activity logs
CREATE POLICY "Students can insert their own activity logs" ON student_activity_logs
FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- Students can view their own activity logs
CREATE POLICY "Students can view their own activity logs" ON student_activity_logs
FOR SELECT USING (
  student_id = auth.uid()
); 