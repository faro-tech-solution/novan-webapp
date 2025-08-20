import { supabase } from '@/lib/supabase';

/**
 * Service for handling exercise order operations
 */

/**
 * Recalculate order_index for all exercises
 * This is useful when category order changes or when exercises are reordered
 */
export const recalculateExerciseOrderIndexes = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('recalculate_all_exercise_order_indexes_after_reorder');
    
    if (error) {
      console.error('Error recalculating exercise order indexes:', error);
      throw new Error(`Error recalculating exercise order indexes: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in recalculateExerciseOrderIndexes:', error);
    throw error;
  }
};

/**
 * Recalculate order_index for exercises in a specific category
 */
export const recalculateCategoryExerciseOrderIndexes = async (categoryId: string): Promise<void> => {
  try {
    // Get the category order
    const { data: category, error: categoryError } = await supabase
      .from('exercise_categories')
      .select('order_index')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      throw new Error(`Error fetching category: ${categoryError.message}`);
    }

    // Get all exercises in this category ordered by created_at
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, created_at')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true });

    if (exercisesError) {
      throw new Error(`Error fetching exercises: ${exercisesError.message}`);
    }

    // Update order_index for each exercise
    const updatePromises = exercises.map((exercise, index) => {
      const newOrderIndex = (category.order_index * 1000) + index;
      return supabase
        .from('exercises')
        .update({ order_index: newOrderIndex })
        .eq('id', exercise.id);
    });

    const results = await Promise.all(updatePromises);
    
    // Check if any update failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(`Error updating exercise order indexes: ${errors[0].error?.message}`);
    }
  } catch (error) {
    console.error('Error in recalculateCategoryExerciseOrderIndexes:', error);
    throw error;
  }
};

/**
 * Update order_index for a single exercise
 */
export const updateExerciseOrderIndex = async (
  exerciseId: string, 
  newOrderIndex: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .update({ order_index: newOrderIndex })
      .eq('id', exerciseId);

    if (error) {
      throw new Error(`Error updating exercise order index: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateExerciseOrderIndex:', error);
    throw error;
  }
};

/**
 * Get the next available order_index for a new exercise in a category
 */
export const getNextOrderIndexForCategory = async (categoryId: string | null): Promise<number> => {
  try {
    if (categoryId) {
      // Get the category order
      const { data: category, error: categoryError } = await supabase
        .from('exercise_categories')
        .select('order_index')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        throw new Error(`Error fetching category: ${categoryError.message}`);
      }

      // Count exercises in this category
      const { count, error: countError } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if (countError) {
        throw new Error(`Error counting exercises: ${countError.message}`);
      }

      return (category.order_index * 1000) + (count || 0);
    } else {
      // For uncategorized exercises, use high numbers
      const { count, error: countError } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .is('category_id', null);

      if (countError) {
        throw new Error(`Error counting uncategorized exercises: ${countError.message}`);
      }

      return 999999 + (count || 0);
    }
  } catch (error) {
    console.error('Error in getNextOrderIndexForCategory:', error);
    throw error;
  }
};
