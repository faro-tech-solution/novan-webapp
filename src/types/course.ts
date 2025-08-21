// Basic Course interface used in most components
export interface Course {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
  price?: number;
  slug: string;
  thumbnail?: string;
}

// Course interface for exercise-related contexts
export interface ExerciseCourse {
  id: string;
  name: string;
  status: string;
  slug: string;
  thumbnail?: string;
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
  slug: string;
  thumbnail?: string;
}

// Course interface for student enrollment context
export interface CourseEnrollment {
  course_id: string;
  enrolled_at: string;
  courses: {
    id: string;
    name: string;
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



// Course interface for review submissions
export interface ReviewCourse {
  id: string;
  name: string;
} 