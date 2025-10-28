import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMyCoursesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myCourses', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch enrollments with course information
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          enrolled_at,
          courses (
            id,
            name,
            description,
            thumbnail,
            slug
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        throw new Error('خطا در دریافت دوره‌های ثبت‌نام شده: ' + enrollmentsError.message);
      }

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      // Transform the data to match the expected format
      const courses = enrollments
        .filter(enrollment => enrollment.courses)
        .map(enrollment => ({
          id: enrollment.course_id,
          title: (enrollment.courses as any).name,
          description: (enrollment.courses as any).description,
          thumbnail: (enrollment.courses as any).thumbnail,
          slug: (enrollment.courses as any).slug,
          enrolled_at: enrollment.enrolled_at,
        }));

      return courses;
    },
    enabled: !!user,
  });
};