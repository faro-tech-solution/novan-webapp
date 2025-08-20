import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAvailableCoursesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First, get the user's enrolled course IDs
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw new Error('خطا در دریافت دوره‌های ثبت‌نام شده');
      }

      const enrolledCourseIds = (enrollments || []).map(e => e.course_id);

      // Then, get all active courses that the user is not enrolled in
      let query = supabase
        .from('courses')
        .select(`
          id,
          name,
          description,
          instructor_id,
          status,
          max_students,
          created_at,
          updated_at,
          price,
          slug,
          thumbnail
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // If user has enrollments, exclude those courses
      if (enrolledCourseIds.length > 0) {
        query = query.not('id', 'in', `(${enrolledCourseIds.join(',')})`);
      }

      const { data: availableCourses, error: coursesError } = await query;

      if (coursesError) {
        console.error('Error fetching available courses:', coursesError);
        throw new Error('خطا در دریافت دوره‌های موجود');
      }

      return availableCourses || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};
