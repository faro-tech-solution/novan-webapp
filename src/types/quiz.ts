export type QuizType = 'chapter' | 'progress';
export type AnswerOption = 'a' | 'b' | 'c' | 'd';

export interface QuizQuestion {
  id: string;
  course_id: string;
  category_id: string | null;
  exercise_id: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: AnswerOption;
  created_by: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  exercise_name?: string;
}

export interface QuizConfig {
  quiz_type: QuizType;
  min_questions: number;
  max_questions: number;
  passing_score: number;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  course_id: string;
  quiz_type: QuizType;
  reference_exercise_id: string | null;
  question_ids: string[];
  score: number;
  total_questions: number;
  passing_score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: AnswerOption;
  is_correct: boolean;
  answered_at: string;
}

export interface QuizAnswerSubmission {
  question_id: string;
  selected_answer: AnswerOption;
}

export interface QuizResults {
  attempt: QuizAttempt;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  percentage: number;
}

export interface QuizQuestionWithStats extends QuizQuestion {
  times_answered?: number;
  correct_answers?: number;
  last_answered?: string;
}

export interface GenerateQuizRequest {
  studentId: string;
  exerciseId: string;
  quizType: QuizType;
}

export interface SubmitQuizRequest {
  attemptId: string;
  answers: QuizAnswerSubmission[];
}
