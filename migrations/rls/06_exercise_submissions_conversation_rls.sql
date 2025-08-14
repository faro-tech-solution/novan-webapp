-- RLS Policies for Exercise Submissions Conversation Table
-- This migration creates Row Level Security policies for exercise_submissions_conversation table
-- to ensure proper access control for conversation messages between trainees and trainers

-- ========================================
-- EXERCISE SUBMISSIONS CONVERSATION TABLE RLS POLICIES
-- ========================================

-- Enable RLS on exercise_submissions_conversation table
ALTER TABLE exercise_submissions_conversation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view conversation messages" ON exercise_submissions_conversation;
DROP POLICY IF EXISTS "Users can create conversation messages" ON exercise_submissions_conversation;
DROP POLICY IF EXISTS "Admins can manage all conversation messages" ON exercise_submissions_conversation;
DROP POLICY IF EXISTS "Trainers can view assigned conversation messages" ON exercise_submissions_conversation;
DROP POLICY IF EXISTS "Students can view their conversation messages" ON exercise_submissions_conversation;

-- ========================================
-- ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all conversation messages
-- Admins have full access to all conversation messages
CREATE POLICY "Admins can manage all conversation messages" ON exercise_submissions_conversation
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- TRAINER RLS POLICIES
-- ========================================

-- Policy 2: Trainers can view conversation messages for their exercises
-- Trainers can view conversation messages for exercises they created
CREATE POLICY "Trainers can view assigned conversation messages" ON exercise_submissions_conversation
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exercise_submissions es
    JOIN exercises e ON es.id = exercise_submissions_conversation.submission_id
    WHERE e.created_by = auth.uid()
    AND es.id = exercise_submissions_conversation.submission_id
  )
);

-- Policy 3: Trainers can create conversation messages for their exercises
-- Trainers can create conversation messages for exercises they created
CREATE POLICY "Trainers can create conversation messages" ON exercise_submissions_conversation
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM exercise_submissions es
    JOIN exercises e ON es.id = exercise_submissions_conversation.submission_id
    WHERE e.created_by = auth.uid()
    AND es.id = exercise_submissions_conversation.submission_id
  )
);

-- ========================================
-- TRAINEE RLS POLICIES
-- ========================================

-- Policy 4: Trainees can view conversation messages for their submissions
-- Trainees can view conversation messages for their own submissions
CREATE POLICY "Students can view their conversation messages" ON exercise_submissions_conversation
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exercise_submissions es
    WHERE es.student_id = auth.uid()
    AND es.id = exercise_submissions_conversation.submission_id
  )
);

-- Policy 5: Trainees can create conversation messages for their submissions
-- Trainees can create conversation messages for their own submissions
CREATE POLICY "Students can create conversation messages" ON exercise_submissions_conversation
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM exercise_submissions es
    WHERE es.student_id = auth.uid()
    AND es.id = exercise_submissions_conversation.submission_id
  )
);

-- ========================================
-- GENERAL POLICIES
-- ========================================

-- Policy 6: Users can view conversation messages (with proper filtering)
-- All authenticated users can view conversation messages with proper access control
CREATE POLICY "Users can view conversation messages" ON exercise_submissions_conversation
FOR SELECT USING (
  auth.role() = 'authenticated'
  AND (
    -- User is the sender of the message
    sender_id = auth.uid()
    OR
    -- User is admin
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR
    -- User is trainer for the exercise
    EXISTS (
      SELECT 1 FROM exercise_submissions es
      JOIN exercises e ON es.id = exercise_submissions_conversation.submission_id
      WHERE e.created_by = auth.uid()
      AND es.id = exercise_submissions_conversation.submission_id
    )
    OR
    -- User is the student who submitted the exercise
    EXISTS (
      SELECT 1 FROM exercise_submissions es
      WHERE es.student_id = auth.uid()
      AND es.id = exercise_submissions_conversation.submission_id
    )
  )
);
