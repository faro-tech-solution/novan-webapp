-- Quiz System Migration
-- ==========================
-- This migration adds a comprehensive quiz system with question bank,
-- quiz attempts tracking, and detailed answer history

-- ========================================
-- 1. CREATE QUIZ TABLES
-- ========================================

-- Table: quiz_questions
-- Stores the question bank with 4 options each
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.exercise_categories(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: quiz_attempts
-- Stores each quiz attempt by a trainee
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('chapter', 'progress')),
  reference_exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions > 0),
  passing_score INTEGER NOT NULL DEFAULT 60 CHECK (passing_score >= 0 AND passing_score <= 100),
  passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table: quiz_answers
-- Stores individual answers for each question in each attempt
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

-- Indexes for quiz_questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_id ON public.quiz_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category_id ON public.quiz_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_exercise_id ON public.quiz_questions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_created_by ON public.quiz_questions(created_by);

-- Indexes for quiz_attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON public.quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_reference_exercise_id ON public.quiz_attempts(reference_exercise_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_type ON public.quiz_attempts(quiz_type);

-- Indexes for quiz_answers
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_student_correct ON public.quiz_answers(question_id, is_correct);

-- ========================================
-- 3. UPDATE EXERCISES TABLE
-- ========================================

-- Add 'quiz' to exercise_type CHECK constraint
DO $$
BEGIN
  -- Drop the existing constraint if it exists
  ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
  
  -- Add new constraint with 'quiz' type
  ALTER TABLE public.exercises 
    ADD CONSTRAINT exercises_exercise_type_check 
    CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe', 'negavid', 'quiz'));
END $$;

-- Note: quiz_config will be stored in the metadata JSONB field of exercises table
-- Format: {"quiz_type": "chapter|progress", "min_questions": 5, "max_questions": 10, "passing_score": 60}

-- ========================================
-- 4. CREATE TRIGGERS
-- ========================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to quiz_questions
CREATE TRIGGER trigger_update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_questions_updated_at();

-- ========================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all quiz tables
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- QUIZ_QUESTIONS RLS POLICIES
-- ========================================

-- Policy 1: Admins can manage all quiz questions
CREATE POLICY "Admins can manage all quiz questions" ON public.quiz_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Trainers can manage quiz questions for their courses
CREATE POLICY "Instructors can manage quiz questions" ON public.quiz_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = quiz_questions.course_id
    AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = quiz_questions.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Policy 3: Trainers can manage questions for assigned courses
CREATE POLICY "Trainers can manage assigned quiz questions" ON public.quiz_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = quiz_questions.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
) WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = quiz_questions.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 4: Users can view quiz questions
CREATE POLICY "Users can view quiz questions" ON public.quiz_questions
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- ========================================
-- QUIZ_ATTEMPTS RLS POLICIES
-- ========================================

-- Policy 1: Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts" ON public.quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Trainers can view quiz attempts for their courses
CREATE POLICY "Trainers can view quiz attempts" ON public.quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = quiz_attempts.course_id
    AND c.instructor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM teacher_course_assignments tca
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE tca.course_id = quiz_attempts.course_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 3: Trainees can view their own quiz attempts
CREATE POLICY "Students can view their quiz attempts" ON public.quiz_attempts
FOR SELECT USING (
  student_id = auth.uid()
);

-- Policy 4: Trainees can create quiz attempts
CREATE POLICY "Students can create quiz attempts" ON public.quiz_attempts
FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- Policy 5: Trainees can update their own quiz attempts
CREATE POLICY "Students can update their quiz attempts" ON public.quiz_attempts
FOR UPDATE USING (
  student_id = auth.uid()
) WITH CHECK (
  student_id = auth.uid()
);

-- ========================================
-- QUIZ_ANSWERS RLS POLICIES
-- ========================================

-- Policy 1: Admins can view all quiz answers
CREATE POLICY "Admins can view all quiz answers" ON public.quiz_answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 2: Trainers can view quiz answers for their courses
CREATE POLICY "Trainers can view quiz answers" ON public.quiz_answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz_attempts qa
    JOIN courses c ON qa.course_id = c.id
    WHERE qa.id = quiz_answers.attempt_id
    AND c.instructor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM quiz_attempts qa
    JOIN teacher_course_assignments tca ON qa.course_id = tca.course_id
    JOIN profiles p ON tca.teacher_id = p.id
    WHERE qa.id = quiz_answers.attempt_id
    AND tca.teacher_id = auth.uid()
    AND p.role = 'trainer'
  )
);

-- Policy 3: Trainees can view their own quiz answers
CREATE POLICY "Students can view their quiz answers" ON public.quiz_answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz_attempts qa
    WHERE qa.id = quiz_answers.attempt_id
    AND qa.student_id = auth.uid()
  )
);

-- Policy 4: Trainees can create quiz answers for their attempts
CREATE POLICY "Students can create quiz answers" ON public.quiz_answers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_attempts qa
    WHERE qa.id = quiz_answers.attempt_id
    AND qa.student_id = auth.uid()
  )
);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE public.quiz_questions IS 'Stores the question bank with 4 options each for quizzes';
COMMENT ON TABLE public.quiz_attempts IS 'Stores each quiz attempt by a trainee';
COMMENT ON TABLE public.quiz_answers IS 'Stores individual answers for each question in each attempt';

COMMENT ON COLUMN public.quiz_attempts.question_ids IS 'JSONB array of question IDs used in this attempt';
COMMENT ON COLUMN public.quiz_attempts.quiz_type IS 'Type of quiz: chapter (only from current category) or progress (all chapters up to current exercise)';
COMMENT ON COLUMN public.quiz_attempts.reference_exercise_id IS 'The last completed exercise that defines the scope of the quiz';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log the migration completion
DO $$
BEGIN
    RAISE NOTICE 'Quiz system migration created successfully!';
    RAISE NOTICE 'Tables created: quiz_questions, quiz_attempts, quiz_answers';
    RAISE NOTICE 'Updated exercises table to include quiz type';
    RAISE NOTICE 'RLS policies applied for all roles';
END $$;
