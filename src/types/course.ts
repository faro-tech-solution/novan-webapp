// Basic Course interface used in most components
export interface Course {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  instructor_name: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
  price?: number;
}

// Course interface for exercise-related contexts
export interface ExerciseCourse {
  id: string;
  name: string;
  instructor_name: string;
  status: string;
}

// Course interface for edit dialog
export interface EditableCourse {
  id: string;
  name: string;
  description: string | null;
  max_students: number | null;
  instructor_id: string;
  status: string;
  price?: number;
}

// Course interface for student enrollment context
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

// Course interface for student courses
export interface StudentCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  difficulty: string;
  category: string;
  thumbnail: string;
  enrollDate: string;
  nextLesson: string | null;
  status: 'active' | 'completed';
  description?: string;
}

// Course term interface
export interface CourseTerm {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  course_id?: string;
  course_name?: string;
  max_students: number;
  created_at?: string;
  student_count?: number;
}

// Course interface for review submissions
export interface ReviewCourse {
  id: string;
  name: string;
} 