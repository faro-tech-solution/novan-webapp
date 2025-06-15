
import { supabase } from '@/integrations/supabase/client';

export interface Award {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  created_at: string;
}

export interface StudentAward {
  id: string;
  student_id: string;
  award_id: string;
  earned_at: string;
  bonus_points: number;
  awards: Award;
}

export const fetchStudentAwards = async (studentId: string): Promise<StudentAward[]> => {
  const { data, error } = await supabase
    .from('student_awards')
    .select(`
      id,
      student_id,
      award_id,
      earned_at,
      bonus_points,
      awards (
        id,
        name,
        description,
        icon,
        points_value,
        rarity,
        category,
        created_at
      )
    `)
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching student awards:', error);
    throw new Error('خطا در دریافت جوایز: ' + error.message);
  }

  return (data || []) as StudentAward[];
};

export const fetchAllAwards = async (): Promise<Award[]> => {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching awards:', error);
    throw new Error('خطا در دریافت لیست جوایز: ' + error.message);
  }

  return (data || []) as Award[];
};

export const checkAndAwardAchievements = async (studentId: string): Promise<void> => {
  const { error } = await supabase.rpc('check_and_award_achievements', {
    student_id_param: studentId
  });

  if (error) {
    console.error('Error checking achievements:', error);
  }
};
