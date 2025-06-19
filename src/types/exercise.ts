import { ExerciseForm, FormAnswer } from './formBuilder';
import { ExerciseCourse } from './course';

export interface Exercise {
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
  created_by: string;
  created_at: string;
  updated_at: string;
  form_structure?: ExerciseForm;
  submissions?: number;
  total_students?: number;
  exercise_status?: 'upcoming' | 'active' | 'overdue' | 'closed';
  course_name?: string;
}

// For upcoming exercises card
export interface UpcomingExercise {
  id: string;
  title: string;
  due_date: string;
  estimated_time: string;
  points: number;
}

// For my exercise table
export interface MyExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_name?: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  points: number;
  estimated_time: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
}

// For exercise detail service
export interface ExerciseDetail {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_name: string;
  difficulty: string;
  points: number;
  estimated_time: string;
  open_date: string;
  due_date: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  form_structure?: ExerciseForm;
  submission_answers?: FormAnswer[];
  feedback?: string;
  score?: number;
}
