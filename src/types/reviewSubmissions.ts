import { ExerciseForm } from './formBuilder';
import { SubmissionStudent } from './student';

export interface Submission {
  id: string;
  exercise_id: string;
  student_id: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  solution: string;
  latest_answer?: string;
  student?: SubmissionStudent;
  exercise: {
    id: string;
    title: string;
    points?: number;
    form_structure: ExerciseForm | null;
    course_id?: string;
    exercise_type?: 'form' | 'video' | 'audio' | 'simple';
    auto_grade?: boolean;
  } | null;
} 