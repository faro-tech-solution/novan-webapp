import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'trainer' | 'trainee';
  class_id: string | null;
  class_name: string | null;
  created_at: string;
  updated_at: string;
  gender: string | null;
  job: string | null;
  education: string | null;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  birthday: string | null;
  ai_familiarity: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  english_level: 'beginner' | 'intermediate' | 'advanced' | 'native' | null;
  telegram_id: string | null;
  whatsapp_id: string | null;
  is_demo?: boolean;
}

export const useUsersQuery = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['users', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as User[];
    },
    enabled: !!profile && profile.role === 'admin',
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    loading,
    error,
    refetch,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  };
}; 