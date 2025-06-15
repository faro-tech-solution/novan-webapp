
export interface Exercise {
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
  created_by: string;
  created_at: string;
  updated_at: string;
  submissions?: number;
  total_students?: number;
  average_score?: number;
  exercise_status?: 'upcoming' | 'active' | 'overdue' | 'closed';
  course_name?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor_name: string;
  status: string;
}
