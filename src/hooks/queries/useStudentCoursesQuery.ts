import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StudentCourse } from '@/hooks/useStudentCourses';

export const useStudentCoursesQuery = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['student-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];

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
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        throw new Error('خطا در دریافت دوره‌ها');
      }

      const enrollmentsWithCourses = enrollments || [];

      // Transform the data to match the StudentCourse interface
      const transformedCourses: StudentCourse[] = enrollmentsWithCourses
        .filter(enrollment => enrollment.courses) // Only include enrollments with valid course data
        .map((enrollment: any) => {
          const course = enrollment.courses;
          const enrollDate = new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR');
          
          // Mock progress data (in a real app, this would come from course progress tracking)
          const mockProgress = Math.floor(Math.random() * 100);
          const mockTotalLessons = Math.floor(Math.random() * 30) + 10;
          const mockCompletedLessons = Math.floor((mockProgress / 100) * mockTotalLessons);
          
          return {
            id: course.id,
            title: course.name,
            instructor: course.instructor_name,
            progress: mockProgress,
            totalLessons: mockTotalLessons,
            completedLessons: mockCompletedLessons,
            duration: `${Math.floor(Math.random() * 15) + 5} ساعت`,
            difficulty: ['مبتدی', 'متوسط', 'پیشرفته'][Math.floor(Math.random() * 3)],
            category: 'برنامه‌نویسی',
            thumbnail: '/placeholder.svg',
            enrollDate,
            nextLesson: mockProgress < 100 ? `درس ${mockCompletedLessons + 1}` : null,
            status: mockProgress >= 100 ? 'completed' : 'active',
            description: course.description
          };
        });

      return transformedCourses;
    },
    enabled: !!user,
  });

  return {
    courses: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}; 