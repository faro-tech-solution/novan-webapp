import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/course';

export const useCoursesQuery = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['courses', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      // Admins see all courses, trainers only see assigned courses
      if (profile.role === 'trainer') {
        const { data: assignments } = await supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', profile.id);

        if (assignments && assignments.length > 0) {
          const assignedCourseIds = assignments.map(a => a.course_id);
          query = query.in('id', assignedCourseIds);
        } else {
          return [];
        }
      }

      const { data: coursesData, error: coursesError } = await query;

      if (coursesError) throw coursesError;

      // Get enrollment counts for each course
      const coursesWithCounts = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('status', 'active');

          return {
            ...course,
            student_count: count || 0,
          };
        })
      );

      return coursesWithCounts;
    },
    enabled: !!profile,
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  return {
    courses,
    loading,
    error,
    refetch,
    deleteCourse: deleteCourseMutation.mutateAsync,
  };
}; 