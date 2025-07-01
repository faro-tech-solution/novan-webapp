import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DailyActivity = Tables<'daily_activities'>;

export const fetchDailyActivities = async (): Promise<DailyActivity[]> => {
  const { data, error } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily activities:', error);
    return [];
  }
  return data || [];
}; 