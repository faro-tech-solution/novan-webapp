// Basic Student interface used in most components
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_demo?: boolean;
  created_at: string;
  gender: string;
  education_level: string;
  courseName: string;
  joinDate: string;
  status: string;
  termName: string;
  course_enrollments: any[];
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  lastActivity: string;
  totalPoints: number;
}

// Student interface for course enrollment context
export interface CourseStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled: boolean;
}

// Student interface for profile modal
export interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_demo?: boolean;
  class_id: string | null;
  class_name: string | null;
  created_at: string;
}

// Student interface for enrollment details
export interface StudentEnrollment {
  course_name: string;
  enrolled_at: string;
  status: string;
  term_name?: string;
}

// Student interface for details dialog
export interface StudentDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  courseName: string;
  joinDate: string;
  status: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  lastActivity: string;
  totalPoints: number;
  termName?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  gender?: string;
  education?: string;
}

// Student interface for accounting context
export interface StudentBalance {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_demo?: boolean;
  };
  balance: number;
}

// Student interface for submission context
export interface SubmissionStudent {
  first_name: string;
  last_name: string;
  email: string;
  is_demo?: boolean;
}

// Student interface for activity logs
export interface StudentActivityLog {
  student_id: string;
  activity_type: string;
  activity_data?: any;
  points_earned?: number;
  session_id?: string;
  duration_minutes?: number;
}

// Student interface for awards
export interface StudentAward {
  id: string;
  student_id: string;
  award_id: string;
  earned_at: string;
  bonus_points: number;
  awards: {
    id: string;
    code: string;
    icon: string;
    points_value: number;
    rarity: string;
    category: string;
    created_at?: string;
  };
}

// Student interface for course enrollment display
export interface StudentCourseEnrollment {
  course: {
    name: string;
  };
  status: string;
  enrolled_at: string;
  course_terms: {
    name: string;
  } | null;
} 