-- Exercise Q&A System RLS Policies
-- ==================================
-- This migration creates Row Level Security policies for the Q&A system
-- to ensure proper access control based on user roles and course enrollment

-- ========================================
-- EXERCISE_QA TABLE RLS POLICIES
-- ========================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enrolled students can view course Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Instructors can view their course Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Admins can view all Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Enrolled students can create Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Instructors can create Q&A in their courses" ON exercise_qa;
DROP POLICY IF EXISTS "Admins can create Q&A anywhere" ON exercise_qa;
DROP POLICY IF EXISTS "Users can update own Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Users can delete own Q&A" ON exercise_qa;
DROP POLICY IF EXISTS "Admins can delete any Q&A" ON exercise_qa;

-- ========================================
-- SELECT POLICIES (View Q&A)
-- ========================================

-- Policy 1: Students can view Q&A in enrolled courses
-- Students can only see Q&A for exercises in courses they are actively enrolled in
CREATE POLICY "Enrolled students can view course Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enrollments ce
      JOIN exercises e ON e.course_id = ce.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Policy 2: Instructors can view Q&A in their courses
-- Instructors can see Q&A for exercises in courses they teach
CREATE POLICY "Instructors can view their course Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Policy 3: Admins can view all Q&A
-- Admins have unrestricted read access to all Q&A
CREATE POLICY "Admins can view all Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- INSERT POLICIES (Create Q&A)
-- ========================================

-- Policy 4: Students can create Q&A in enrolled courses
-- Students can post questions/answers only in courses they are actively enrolled in
CREATE POLICY "Enrolled students can create Q&A" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM course_enrollments ce
      JOIN exercises e ON e.course_id = ce.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Policy 5: Instructors can create Q&A in their courses
-- Instructors can post in exercises of courses they teach
CREATE POLICY "Instructors can create Q&A in their courses" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercises e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Policy 6: Admins can create Q&A anywhere
-- Admins can post in any course
CREATE POLICY "Admins can create Q&A anywhere" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- UPDATE POLICIES (Edit Q&A)
-- ========================================

-- Policy 7: Users can update their own Q&A
-- All users can only edit their own posts
CREATE POLICY "Users can update own Q&A" ON exercise_qa
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- DELETE POLICIES (Delete Q&A)
-- ========================================

-- Policy 8: Users can delete their own Q&A
-- All users can only delete their own posts
CREATE POLICY "Users can delete own Q&A" ON exercise_qa
  FOR DELETE USING (auth.uid() = user_id);

-- Policy 9: Admins can delete any Q&A
-- Admins can delete any post for moderation purposes
CREATE POLICY "Admins can delete any Q&A" ON exercise_qa
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- EXERCISE_QA_VOTE TABLE RLS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own votes" ON exercise_qa_vote;
DROP POLICY IF EXISTS "Admins can view all votes" ON exercise_qa_vote;
DROP POLICY IF EXISTS "Enrolled students can vote" ON exercise_qa_vote;
DROP POLICY IF EXISTS "Instructors can vote in their courses" ON exercise_qa_vote;
DROP POLICY IF EXISTS "Admins can vote anywhere" ON exercise_qa_vote;
DROP POLICY IF EXISTS "Users can delete own vote" ON exercise_qa_vote;

-- ========================================
-- SELECT POLICIES (View Votes)
-- ========================================

-- Policy 1: Users can view their own votes
-- Users can only see their own votes (for UI purposes)
CREATE POLICY "Users can view own votes" ON exercise_qa_vote
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Admins can view all votes
-- Admins can see all individual votes for analytics
CREATE POLICY "Admins can view all votes" ON exercise_qa_vote
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- INSERT POLICIES (Cast Vote)
-- ========================================

-- Policy 3: Students can vote in enrolled courses
-- Students can vote on Q&A in courses they are actively enrolled in
CREATE POLICY "Enrolled students can vote" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN course_enrollments ce ON ce.course_id = e.course_id
      WHERE qa.id = exercise_qa_vote.exercise_qa_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Policy 4: Instructors can vote in their courses
-- Instructors can vote on Q&A in courses they teach
CREATE POLICY "Instructors can vote in their courses" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN courses c ON c.id = e.course_id
      WHERE qa.id = exercise_qa_vote.exercise_qa_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Policy 5: Admins can vote anywhere
-- Admins can vote on any Q&A
CREATE POLICY "Admins can vote anywhere" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- DELETE POLICIES (Retract Vote)
-- ========================================

-- Policy 6: Users can delete their own vote
-- Users can retract their own vote
CREATE POLICY "Users can delete own vote" ON exercise_qa_vote
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- EXERCISE_QA_BOOKMARK TABLE RLS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own bookmarks" ON exercise_qa_bookmark;
DROP POLICY IF EXISTS "Enrolled students can bookmark" ON exercise_qa_bookmark;
DROP POLICY IF EXISTS "Instructors can bookmark in their courses" ON exercise_qa_bookmark;
DROP POLICY IF EXISTS "Admins can bookmark anywhere" ON exercise_qa_bookmark;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON exercise_qa_bookmark;

-- ========================================
-- SELECT POLICIES (View Bookmarks)
-- ========================================

-- Policy 1: Users can view their own bookmarks
-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON exercise_qa_bookmark
  FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- INSERT POLICIES (Add Bookmark)
-- ========================================

-- Policy 2: Students can bookmark in enrolled courses
-- Students can bookmark Q&A in courses they are actively enrolled in
CREATE POLICY "Enrolled students can bookmark" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN course_enrollments ce ON ce.course_id = e.course_id
      WHERE qa.id = exercise_qa_bookmark.qa_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Policy 3: Instructors can bookmark in their courses
-- Instructors can bookmark Q&A in courses they teach
CREATE POLICY "Instructors can bookmark in their courses" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN courses c ON c.id = e.course_id
      WHERE qa.id = exercise_qa_bookmark.qa_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Policy 4: Admins can bookmark anywhere
-- Admins can bookmark any Q&A
CREATE POLICY "Admins can bookmark anywhere" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ========================================
-- DELETE POLICIES (Remove Bookmark)
-- ========================================

-- Policy 5: Users can delete their own bookmarks
-- Users can remove their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON exercise_qa_bookmark
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- PERFORMANCE INDEXES
-- ========================================

-- Create additional indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_exercise_qa_vote_composite ON exercise_qa_vote(exercise_qa_id, user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_qa_bookmark_composite ON exercise_qa_bookmark(qa_id, user_id);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify RLS is enabled for all Q&A tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('exercise_qa', 'exercise_qa_vote', 'exercise_qa_bookmark')
ORDER BY tablename;

-- List all policies for Q&A tables
SELECT 
  'Exercise Q&A Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_qa'
ORDER BY policyname;

SELECT 
  'Exercise Q&A Vote Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_qa_vote'
ORDER BY policyname;

SELECT 
  'Exercise Q&A Bookmark Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_qa_bookmark'
ORDER BY policyname;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Exercise Q&A RLS policies created successfully:';
    RAISE NOTICE '- exercise_qa: 9 policies (3 SELECT, 3 INSERT, 1 UPDATE, 2 DELETE)';
    RAISE NOTICE '- exercise_qa_vote: 6 policies (2 SELECT, 3 INSERT, 1 DELETE)';
    RAISE NOTICE '- exercise_qa_bookmark: 5 policies (1 SELECT, 3 INSERT, 1 DELETE)';
    RAISE NOTICE 'Total: 20 RLS policies for complete access control';
END $$;

