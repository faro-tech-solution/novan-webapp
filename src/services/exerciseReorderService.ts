import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';

export interface ReorderExerciseData {
  exerciseId: string;
  newOrderIndex: number;
  courseId: string;
  categoryId?: string | null;
}

export const reorderExercises = async (reorderData: ReorderExerciseData[]): Promise<Exercise[]> => {
  try {
    // Update each exercise individually with its new sort order
    const results = [];
    
    for (const { exerciseId, newOrderIndex } of reorderData) {
      const { data, error } = await supabase
        .from('exercises')
        .update({ sort: newOrderIndex })
        .eq('id', exerciseId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating exercise:', error);
        throw new Error(`Error updating exercise: ${error.message}`);
      }
      
      results.push(data);
    }

    return results as Exercise[];
  } catch (error) {
    console.error('Error in reorderExercises:', error);
    throw error;
  }
};

export const getExercisesByCourse = async (courseId: string): Promise<Exercise[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('course_id', courseId)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching exercises by course:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    return (data || []) as Exercise[];
  } catch (error) {
    console.error('Error in getExercisesByCourse:', error);
    throw error;
  }
}; 