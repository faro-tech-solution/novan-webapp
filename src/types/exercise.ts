import { ExerciseForm, FormAnswer } from './formBuilder';
import { Json } from '@/integrations/supabase/types';

export type ExerciseType = 'form' | 'video' | 'audio' | 'simple';
export type SubmissionStatusType = 'not_started' | 'pending' | 'completed' | 'overdue';
export type ExerciseStatusType = 'upcoming' | 'active' | 'overdue' | 'closed';

// Exercise category interface
export interface ExerciseCategory {
  id: string;
  name: string;
  description: string | null;
  course_id: string;
  order_index: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  exercise_count?: number;
}

// Base exercise interface for database records
export interface Exercise {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  category_id?: string | null;
  difficulty: string;

  points: number;
  estimated_time: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  exercise_type: ExerciseType;
  content_url?: string | null;
  auto_grade: boolean;
  form_structure?: ExerciseForm | Json | null;
  submissions?: number;
  total_students?: number;
  exercise_status?: ExerciseStatusType;
  course_name?: string;
  category_name?: string;
}

// Exercise with course information from database
export interface ExerciseWithCourse extends Omit<Exercise, 'form_structure'> {
  form_structure: Json | null;
  courses: {
    name: string;
  } | null;
}

// Exercise submission in database
export interface ExerciseSubmission {
  solution: string;
  feedback: string | null;
  score: number | null;
  submitted_at: string;
  auto_graded: boolean;
  completion_percentage: number;
}

// For submitting a new submission
export interface SubmissionData {
  exercise_id: string;
  student_id: string;
  solution: string;
  submitted_at: string;
  course_id: string;
}

// For upcoming exercises card
export interface UpcomingExercise {
  id: string;
  title: string;
  estimated_time: string;
  points: number;
  difficulty: string;
  submission_status: SubmissionStatusType;
}

// For my exercise table
export interface MyExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_name?: string;
  category_id?: string | null;
  category_name?: string;
  difficulty: string;
  points: number;
  estimated_time: string;
  exercise_type: ExerciseType;
  content_url?: string | null;
  auto_grade: boolean;
  submission_status: SubmissionStatusType;
  completion_percentage?: number;
  auto_graded?: boolean;
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
  submission_status: SubmissionStatusType;
  exercise_type: ExerciseType;
  content_url?: string | null;
  auto_grade: boolean;
  form_structure?: ExerciseForm;
  submission_answers?: FormAnswer[];
  feedback?: string;
  score?: number;
  completion_percentage?: number;
  auto_graded?: boolean;
}
