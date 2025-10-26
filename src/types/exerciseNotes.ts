import { ExerciseWithCourse } from './exercise';

export interface ExerciseNote {
  id: string;
  exercise_id: string;
  course_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  exercises?: {
    id: string;
    title: string;
    order_index?: number;
  };
}

export interface CreateNoteData {
  exercise_id: string;
  course_id: string;
  content: string;
}

export interface UpdateNoteData {
  content: string;
}
