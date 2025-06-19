// Basic Instructor interface used in most components
export interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Instructor interface for card display
export interface InstructorCard {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  image: string;
  rating: number;
  students: number;
  courses: number;
  expertise: string[];
}

// Instructor interface for course management
export interface CourseInstructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

// Instructor interface for assignments
export interface TeacherAssignment {
  course_ids: string[];
  term_ids: string[];
}

// Instructor interface for profile
export interface InstructorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  expertise?: string[];
  rating?: number;
  total_students?: number;
  total_courses?: number;
  created_at?: string;
  updated_at?: string;
} 