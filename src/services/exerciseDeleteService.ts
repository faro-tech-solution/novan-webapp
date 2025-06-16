
import { supabase } from '@/integrations/supabase/client';

export const deleteExercise = async (id: string): Promise<{ error: string | null }> => {
  console.log('Deleting exercise:', id);

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exercise:', error);
    return { error: error.message };
  }

  console.log('Exercise deleted successfully');
  return { error: null };
};
