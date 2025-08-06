import { ExerciseCategory } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

export interface CreateExerciseCategoryData {
  name: string;
  description?: string;
  course_id: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateExerciseCategoryData {
  name?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}

// Fetch categories for a specific course
export const fetchExerciseCategories = async (courseId: string): Promise<ExerciseCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('exercise_categories')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message.includes('relation "exercise_categories" does not exist')) {
        console.warn('Exercise categories table does not exist. Please run the migration first.');
        return [];
      }
      throw new Error(`Error fetching exercise categories: ${error.message}`);
    }

    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (category: any) => {
        const { count } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          exercise_count: count || 0
        };
      })
    );

    return categoriesWithCounts as ExerciseCategory[];
  } catch (error) {
    console.error('Error in fetchExerciseCategories:', error);
    // Return empty array in case of error to prevent breaking the UI
    return [];
  }
};

// Create a new exercise category
export const createExerciseCategory = async (
  categoryData: CreateExerciseCategoryData, 
  createdBy: string
): Promise<ExerciseCategory> => {
  try {
    const { data, error } = await supabase
      .from('exercise_categories')
      .insert({
        ...categoryData,
        created_by: createdBy,
        is_active: categoryData.is_active ?? true,
        order_index: categoryData.order_index ?? 0
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating exercise category: ${error.message}`);
    }

    // Get exercise count for the new category (will be 0)
    const categoryWithCount = {
      ...data,
      exercise_count: 0
    };

    return categoryWithCount as ExerciseCategory;
  } catch (error) {
    console.error('Error in createExerciseCategory:', error);
    throw error;
  }
};

// Update an exercise category
export const updateExerciseCategory = async (
  categoryId: string, 
  categoryData: UpdateExerciseCategoryData
): Promise<ExerciseCategory> => {
  try {
    const { data, error } = await supabase
      .from('exercise_categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating exercise category: ${error.message}`);
    }

    // Get exercise count for the updated category
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    const categoryWithCount = {
      ...data,
      exercise_count: count || 0
    };

    return categoryWithCount as ExerciseCategory;
  } catch (error) {
    console.error('Error in updateExerciseCategory:', error);
    throw error;
  }
};

// Delete an exercise category
export const deleteExerciseCategory = async (categoryId: string): Promise<void> => {
  try {
    // First check if the category has any exercises
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (count && count > 0) {
      throw new Error('Cannot delete category with exercises. Please move or delete the exercises first.');
    }

    const { error } = await supabase
      .from('exercise_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Error deleting exercise category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteExerciseCategory:', error);
    throw error;
  }
};

// Reorder categories
export const reorderExerciseCategories = async (
  courseId: string, 
  categoryIds: string[]
): Promise<void> => {
  try {
    // Update the order_index for each category
    const updatePromises = categoryIds.map((categoryId, index) => 
      supabase
        .from('exercise_categories')
        .update({ order_index: index })
        .eq('id', categoryId)
        .eq('course_id', courseId) // Additional safety check
    );

    const results = await Promise.all(updatePromises);
    
    // Check if any update failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(`Error reordering categories: ${errors[0].error?.message}`);
    }
  } catch (error) {
    console.error('Error in reorderExerciseCategories:', error);
    throw error;
  }
}; 