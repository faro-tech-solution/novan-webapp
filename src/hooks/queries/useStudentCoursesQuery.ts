import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

const fetchStudentCourses = async (userId: string | undefined): Promise<StudentCourse[]> => {
  if (!userId) return [];

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      enrolled_at,
      status,
      courses (
        id,
        name,
        description,
        instructor_name
      )
    `)
    .eq('student_id', userId)
    .eq('status', 'active');

  if (enrollmentsError) {
    throw new Error('خطا در دریافت دوره‌ها');
  }

  const enrollmentsWithCourses = (enrollments || []).filter(
    (enrollment) => enrollment.courses && typeof enrollment.courses === 'object' && !('code' in enrollment.courses)
  );

  // Transform the data to match the StudentCourse interface
  return enrollmentsWithCourses.map(enrollment => {
    const course = enrollment.courses || {};
    return {
      id: enrollment.course_id,
      title: course.name ?? '',
      instructor: course.instructor_name ?? '',
      progress: 0, // This would need to be calculated based on completed lessons
      totalLessons: 0, // This would need to be fetched from lessons table
      completedLessons: 0, // This would need to be calculated from student progress
      duration: '0 ساعت', // This would need to be calculated from lessons
      difficulty: 'متوسط', // Default value since column doesn't exist
      category: 'عمومی', // Default value since column doesn't exist
      thumbnail: '', // Default value since column doesn't exist
      enrollDate: enrollment.enrolled_at,
      nextLesson: null, // This would need to be calculated based on progress
      status: enrollment.status as 'active' | 'completed',
      description: course.description ?? undefined
    };
  });
};

export const useStudentCoursesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-courses', user?.id],
    queryFn: () => fetchStudentCourses(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
}; 