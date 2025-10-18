// Basic Course interface used in most components
export interface Course {
  id: string;
  name: string;
  description: string | null;
  price: number;
  created_at: string | null;
  updated_at: string | null;
  student_count?: number;
  slug?: string;
  thumbnail?: string | null;
  status?: string;
  max_students?: number | null;
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
  max_students?: number | null;
  status?: string;
  price: number;
  slug?: string;
  thumbnail?: string | null;
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

// Public course interfaces for non-authenticated users
export interface CourseIntroVideo {
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
}

export interface CoursePreviewData {
  topics: string[];
  side_description?: string | null;
  description: string;
  differentiators?: Array<{
    title: string;
    description: string;
    color: string;
  }>;
  who_is_for?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  testimonials?: Array<{
    name: string;
    rating: number;
    text: string;
  }>;
  payments: {
    zarinpal: string;
    stripe: string;
  },
  intro_videos: CourseIntroVideo[];
}

export interface PublicCourse extends Course {
  preview_data: CoursePreviewData | null;
  instructor_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  slug: string;
  status: string;
  thumbnail?: string | null;
  max_students?: number | null;
} 