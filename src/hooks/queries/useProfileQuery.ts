import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  gender?: string;
  job?: string;
  education?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  birthday?: string;
  ai_familiarity?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  english_level?: 'beginner' | 'intermediate' | 'advanced' | 'native';
  telegram_id?: string;
  whatsapp_id?: string;
}

export const useProfileQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Unauthorized');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfileMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Unauthorized');
      
      // Convert empty birthday string to null
      const processedUpdates = {
        ...updates,
        birthday: updates.birthday === '' ? null : updates.birthday
      };

      const { error } = await supabase
        .from('profiles')
        .update(processedUpdates)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePasswordMutation = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ current_password, new_password }: { current_password: string; new_password: string }) => {
      if (!user) throw new Error('Unauthorized');
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: current_password,
      });
      if (signInError) throw new Error('رمز عبور فعلی اشتباه است');
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: new_password,
      });
      if (updateError) throw updateError;
    },
  });
}; 