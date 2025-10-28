export interface ExerciseData {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  difficulty: string | null;

  points: number;
  estimated_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  exercise_type: 'form' | 'video' | 'audio' | 'simple' | 'iframe' | 'negavid';
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
  solution?: string;
}
