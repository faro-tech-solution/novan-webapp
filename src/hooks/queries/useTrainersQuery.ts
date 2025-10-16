import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'trainee';
}

export const useStudentsQuery = () => {
  return useQuery({
    queryKey: ['students-for-filter'],
    queryFn: async (): Promise<Student[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role
        `)
        .eq('role', 'trainee')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(`Error fetching students: ${error.message}`);
      }

      return data || [];
    },
  });
};
