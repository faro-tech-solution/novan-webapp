
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

export interface CourseEnrollment {
  course_id: string;
  enrolled_at: string;
  term_id: string | null;
  courses: {
    id: string;
    name: string;
  } | null;
  course_terms: {
    id: string;
    start_date: string;
    end_date: string;
  } | null;
}

export interface ExerciseData {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
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
}
