import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
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

export const useStudentsQuery = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, error, refetch } = useQuery({
    queryKey: ['students', profile?.id, profile?.role],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          gender,
          education,
          course_enrollments (
            course:courses (
              name
            ),
            status,
            enrolled_at,
            course_terms (
              name
            )
          )
        `)
        .eq('role', 'trainee')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(student => {
        const enrollment = student.course_enrollments?.[0];
        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          role: student.role,
          created_at: student.created_at,
          gender: student.gender,
          education_level: student.education,
          courseName: enrollment?.course?.name || 'بدون دوره',
          joinDate: enrollment?.enrolled_at || student.created_at,
          status: enrollment?.status || 'فعال',
          termName: enrollment?.course_terms?.name || 'عمومی',
          course_enrollments: student.course_enrollments,
          completedExercises: 0,
          totalExercises: 0,
          averageScore: 0,
          lastActivity: student.created_at,
          totalPoints: 0
        } as Student;
      });
    },
    enabled: !!user,
  });

  return {
    students,
    loading: isLoading,
    error,
    refetch,
  };
}; 