import { ExerciseCourse } from './course';

export interface ExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_name?: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
}

export interface ExerciseData {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  difficulty: string;
  days_to_due: number;
  days_to_open: number;
  days_to_close: number;
  points: number;
  estimated_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  exercise_type: 'form' | 'video' | 'audio' | 'simple';
  content_url?: string | null;
  auto_grade: boolean;
  courses: {
    id: string;
    name: string;
  } | null;
}

export interface ExerciseSubmission {
  exercise_id: string;
  student_id: string;
  score: number | null;
  submitted_at: string;
  feedback: string | null;
  auto_graded: boolean;
  completion_percentage: number;
}
