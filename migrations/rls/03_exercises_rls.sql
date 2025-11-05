-- Consolidated RLS Policies for All Exercise-Related Tables
-- This migration creates Row Level Security policies for exercises, exercise_submissions, and exercise_categories tables
-- to ensure proper access control for exercise management and submissions

-- ========================================
-- EXERCISES TABLE RLS POLICIES
-- ========================================

-- Enable RLS on exercises table if not already enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Instructors can manage their exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage all exercises" ON exercises;
DROP POLICY IF EXISTS "Trainers can view assigned exercises" ON exercises;

-- ========================================
-- EXERCISES TABLE - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all exercises
-- Admins have full access to all exercises
CREATE POLICY "Admins can manage all exercises" ON exercises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- EXERCISES TABLE - TRAINERS RLS POLICIES
-- ========================================

-- Policy 2: Trainers can manage their exercises
-- Trainers can create, update, and delete exercises they created
CREATE POLICY "Instructors can manage their exercises" ON exercises
FOR ALL USING (
  created_by = auth.uid()
) WITH CHECK (
  created_by = auth.uid()
);

-- Policy 3: Trainers can view exercises for their assigned courses
-- Trainers can view exercises for courses they are assigned to via teacher_course_assignments
CREATE POLICY "Trainers can view assigned exercises" ON exercises
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = exercises.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- ========================================
-- EXERCISES TABLE - GENERAL RLS POLICIES
-- ========================================

-- Policy 4: Users can view exercises (needed for dashboards)
-- Trainees can view non-disabled exercises only
-- Admins and trainers can see all exercises (including disabled ones)
CREATE POLICY "Users can view exercises" ON exercises
FOR SELECT USING (
  auth.role() = 'authenticated'
  AND (
    -- Admins and trainers can see all exercises (including disabled)
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'trainer')
    )
    OR
    -- Trainees can only see non-disabled exercises
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'trainer')
      )
      AND is_disabled = false
    )
  )
);

-- ========================================
-- EXERCISE SUBMISSIONS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on exercise_submissions table if not already enabled
ALTER TABLE exercise_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can view their submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can view course submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Trainers can view assigned submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Instructors can grade submissions" ON exercise_submissions;
DROP POLICY IF EXISTS "Admins can grade all submissions" ON exercise_submissions;

-- ========================================
-- EXERCISE SUBMISSIONS - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can view all submissions
-- Admins can view all exercise submissions
CREATE POLICY "Admins can view all submissions" ON exercise_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Admins can grade all submissions
-- Admins can grade all exercise submissions
CREATE POLICY "Admins can grade all submissions" ON exercise_submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- EXERCISE SUBMISSIONS - TRAINERS RLS POLICIES
-- ========================================

-- Policy 3: Trainers can view submissions for their exercises
-- Trainers can view submissions for exercises they created
CREATE POLICY "Instructors can view course submissions" ON exercise_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
);

-- Policy 4: Trainers can grade submissions for their exercises
-- Trainers can grade submissions for exercises they created
CREATE POLICY "Instructors can grade submissions" ON exercise_submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.id = exercise_submissions.exercise_id
    AND e.created_by = auth.uid()
  )
);

-- Policy 5: Trainers can view submissions for their assigned courses
-- Trainers can view submissions for courses they are assigned to
CREATE POLICY "Trainers can view assigned submissions" ON exercise_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    JOIN exercises e ON tca.course_id = e.course_id
    WHERE e.id = exercise_submissions.exercise_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- ========================================
-- EXERCISE SUBMISSIONS - TRAINEES RLS POLICIES
-- ========================================

-- Policy 6: Trainees can view their own submissions
-- Trainees can view their own exercise submissions
CREATE POLICY "Students can view their submissions" ON exercise_submissions
FOR SELECT USING (
  student_id = auth.uid()
);

-- Policy 7: Trainees can create submissions
-- Trainees can create new exercise submissions
CREATE POLICY "Students can create submissions" ON exercise_submissions
FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- ========================================
-- EXERCISE CATEGORIES TABLE RLS POLICIES
-- ========================================

-- Enable RLS on exercise_categories table if not already enabled
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view exercise categories" ON exercise_categories;
DROP POLICY IF EXISTS "Instructors can manage exercise categories" ON exercise_categories;
DROP POLICY IF EXISTS "Admins can manage all exercise categories" ON exercise_categories;
DROP POLICY IF EXISTS "Trainers can manage assigned exercise categories" ON exercise_categories;

-- ========================================
-- EXERCISE CATEGORIES - ADMIN RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all exercise categories
-- Admins have full access to all exercise categories
CREATE POLICY "Admins can manage all exercise categories" ON exercise_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- EXERCISE CATEGORIES - TRAINERS RLS POLICIES
-- ========================================

-- Policy 2: Trainers can manage exercise categories for their courses
-- Trainers can create, update, and delete categories for courses they created
CREATE POLICY "Instructors can manage exercise categories" ON exercise_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = exercise_categories.course_id
    AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = exercise_categories.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 3: Trainers can manage categories for courses they are assigned to
-- Trainers can manage categories for courses they are assigned to via teacher_course_assignments
CREATE POLICY "Trainers can manage assigned exercise categories" ON exercise_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = exercise_categories.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = exercise_categories.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- ========================================
-- EXERCISE CATEGORIES - GENERAL RLS POLICIES
-- ========================================

-- Policy 4: Users can view exercise categories
-- All authenticated users can view exercise categories
CREATE POLICY "Users can view exercise categories" ON exercise_categories
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- PERFORMANCE INDEXES
-- ========================================

-- Create indexes to improve RLS policy performance for exercises table
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_course_id ON exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category_id ON exercises(category_id);

-- Create indexes to improve RLS policy performance for exercise_submissions table
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_student_id ON exercise_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_exercise_id ON exercise_submissions(exercise_id);

-- Create indexes to improve RLS policy performance for exercise_categories table
CREATE INDEX IF NOT EXISTS idx_exercise_categories_course_id ON exercise_categories(course_id);
CREATE INDEX IF NOT EXISTS idx_exercise_categories_order ON exercise_categories(order_index);

-- Create indexes for teacher_course_assignments (used in policies)
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_teacher_id ON teacher_course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_assignments_course_id ON teacher_course_assignments(course_id);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify RLS is enabled for all exercise-related tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('exercises', 'exercise_submissions', 'exercise_categories')
ORDER BY tablename;

-- List all policies for exercises table
SELECT 
  'Exercises Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercises'
ORDER BY policyname;

-- List all policies for exercise_submissions table
SELECT 
  'Exercise Submissions Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_submissions'
ORDER BY policyname;

-- List all policies for exercise_categories table
SELECT 
  'Exercise Categories Policies:' as table_info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'exercise_categories'
ORDER BY policyname; 