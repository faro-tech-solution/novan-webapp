-- Migration: Add Exercise Tabs Features
-- Creates tables for Q&A, votes, and notes functionality

BEGIN;

-- 1. Create exercise_questions table for Q&A
CREATE TABLE IF NOT EXISTS public.exercise_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.exercise_questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create exercise_question_votes table for votes
CREATE TABLE IF NOT EXISTS public.exercise_question_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.exercise_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- 3. Create exercise_notes table for private notes
CREATE TABLE IF NOT EXISTS public.exercise_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for exercise_questions
CREATE INDEX IF NOT EXISTS idx_exercise_questions_exercise_id ON public.exercise_questions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_questions_course_id ON public.exercise_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_exercise_questions_parent_id ON public.exercise_questions(parent_id);
CREATE INDEX IF NOT EXISTS idx_exercise_questions_user_id ON public.exercise_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_questions_created_at ON public.exercise_questions(created_at);
CREATE INDEX IF NOT EXISTS idx_exercise_questions_is_deleted ON public.exercise_questions(is_deleted);

-- Create indexes for exercise_question_votes
CREATE INDEX IF NOT EXISTS idx_exercise_question_votes_question_id ON public.exercise_question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_exercise_question_votes_user_id ON public.exercise_question_votes(user_id);

-- Create indexes for exercise_notes
CREATE INDEX IF NOT EXISTS idx_exercise_notes_exercise_id ON public.exercise_notes(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_notes_course_id ON public.exercise_notes(course_id);
CREATE INDEX IF NOT EXISTS idx_exercise_notes_user_id ON public.exercise_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_notes_created_at ON public.exercise_notes(created_at);

-- Enable RLS
ALTER TABLE public.exercise_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercise_questions
CREATE POLICY "All enrolled users can read questions"
  ON public.exercise_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = exercise_questions.course_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.teacher_course_assignments tca
      WHERE tca.course_id = exercise_questions.course_id
      AND tca.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'trainer')
    )
  );

CREATE POLICY "Enrolled users can insert their own questions"
  ON public.exercise_questions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.course_id = exercise_questions.course_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'trainer')
      )
    )
  );

CREATE POLICY "Only question author or admin can update"
  ON public.exercise_questions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'trainer')
    )
  );

CREATE POLICY "Only question author or admin can delete"
  ON public.exercise_questions FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'trainer')
    )
  );

-- RLS Policies for exercise_question_votes
CREATE POLICY "Users can read all votes"
  ON public.exercise_question_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exercise_questions eq
      JOIN public.course_enrollments ce ON ce.course_id = eq.course_id
      WHERE eq.id = exercise_question_votes.question_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'trainer')
    )
  );

CREATE POLICY "Users can manage their own votes"
  ON public.exercise_question_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for exercise_notes
CREATE POLICY "Users can only access their own notes"
  ON public.exercise_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.exercise_questions IS 'Stores questions and answers for exercises';
COMMENT ON TABLE public.exercise_question_votes IS 'Stores upvote/downvote records for questions';
COMMENT ON TABLE public.exercise_notes IS 'Stores private user notes for exercises';

COMMIT;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Exercise tabs features migration completed successfully';
  RAISE NOTICE 'Created tables: exercise_questions, exercise_question_votes, exercise_notes';
  RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
