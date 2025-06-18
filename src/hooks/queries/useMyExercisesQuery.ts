import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Exercise = Database['public']['Tables']['exercises']['Row'] & {
  exercise_submissions: Database['public']['Tables']['exercise_submissions']['Row'][];
};

export const useMyExercisesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myExercises', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_submissions (
            id,
            score,
            submitted_at,
            feedback,
            graded_at,
            graded_by,
            solution,
            student_email,
            student_id,
            student_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as unknown as Exercise[];
    },
    enabled: !!user,
  });
}; 