import { supabase } from '@/integrations/supabase/client';
import { StudentAward } from '@/types/student';
import { AwardCode } from '@/translations/awardTranslations';

export interface Award {
  id: string;
  code: AwardCode;
  icon: string;
  points_value: number;
  rarity: string;
  category: string;
  created_at: string;
  // name and description removed from DB, now only in translations
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
        code,
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

  return (data || []) as any[];
  // return (data || []) as StudentAward[];
};

export const fetchAllAwards = async (): Promise<Award[]> => {
  const { data, error } = await supabase
    .from('awards')
    .select('id, code, icon, points_value, rarity, category, created_at')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching awards:', error);
    throw new Error('خطا در دریافت لیست جوایز: ' + error.message);
  }

  return (data || []) as any[];
  // return (data || []) as Award[];
};

export const checkAndAwardAchievements = async (studentId: string): Promise<void> => {
  console.log('Checking achievements for student:', studentId);
  
  const { data, error } = await supabase.rpc('check_and_award_achievements', {
    student_id_param: studentId
  });

  if (error) {
    console.error('Error checking achievements:', error);
    throw new Error('خطا در بررسی دستاوردها: ' + error.message);
  }
  
  console.log('Achievement check result:', data);
  
  // Verify if any new awards were added
  const { data: newAwards, error: fetchError } = await supabase
    .from('student_awards')
    .select('*')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })
    .limit(5);
    
  if (fetchError) {
    console.error('Error fetching recent awards:', fetchError);
  } else {
    console.log('Recent student awards:', newAwards);
  }
};
