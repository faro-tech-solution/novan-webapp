
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
  submissions?: number;
  total_students?: number;
  exercise_status?: 'upcoming' | 'active' | 'overdue' | 'closed';
  course_name?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor_name: string;
  status: string;
}
