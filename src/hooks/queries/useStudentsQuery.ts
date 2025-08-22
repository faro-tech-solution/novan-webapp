import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from '@/types/student';

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
          is_demo,
          created_at,
          gender,
          education,
          course_enrollments (
            course:courses (
              name
            ),
            status,
            enrolled_at
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
          is_demo: student.is_demo,
          created_at: student.created_at,
          gender: student.gender,
          education_level: student.education,
          courseName: enrollment?.course?.name || 'بدون دوره',
          joinDate: enrollment?.enrolled_at || student.created_at,
          status: enrollment?.status || 'فعال',
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

  const updateStudentMutation = useMutation({
    mutationFn: async ({ studentId, updates }: { studentId: string; updates: Partial<Student> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', studentId);
      
      if (error) throw error;
      return { studentId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);
      
      if (error) throw error;
      return studentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });

  return {
    students,
    loading: isLoading,
    error,
    refetch,
    updateStudent: updateStudentMutation.mutateAsync,
    deleteStudent: deleteStudentMutation.mutateAsync
  };
}; 