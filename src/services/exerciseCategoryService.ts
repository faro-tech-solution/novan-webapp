import { ExerciseCategory } from '@/types/exercise';

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
export const fetchExerciseCategories = async (_courseId: string): Promise<ExerciseCategory[]> => {
  try {
    // TODO: Uncomment this after applying the migration
    // const { data, error } = await supabase
    //   .from('exercise_categories' as any)
    //   .select('*')
    //   .eq('course_id', courseId)
    //   .eq('is_active', true)
    //   .order('order_index', { ascending: true })
    //   .order('created_at', { ascending: true });

    // if (error) {
    //   if (error.message.includes('relation "exercise_categories" does not exist')) {
    //     console.warn('Exercise categories table does not exist. Please run the migration first.');
    //     return [];
    //   }
    //   throw new Error(`Error fetching exercise categories: ${error.message}`);
    // }

    // const categoriesWithCounts = await Promise.all(
    //   (data || []).map(async (category: any) => {
    //     const { count } = await supabase
    //       .from('exercises')
    //       .select('*', { count: 'exact', head: true })
    //       .eq('category_id', category.id);

    //     return {
    //       ...category,
    //       exercise_count: count || 0
    //     };
    //   })
    // );

    // return categoriesWithCounts as ExerciseCategory[];

    // Temporary: Return empty array until migration is applied
    console.warn('Exercise categories feature is not yet available. Please apply the migration first.');
    return [];
  } catch (error) {
    console.error('Error in fetchExerciseCategories:', error);
    throw error;
  }
};

// Create a new exercise category
export const createExerciseCategory = async (
  _categoryData: CreateExerciseCategoryData, 
  _createdBy: string
): Promise<ExerciseCategory> => {
  throw new Error('Exercise categories feature is not yet available. Please apply the migration first.');
};

// Update an exercise category
export const updateExerciseCategory = async (
  _categoryId: string, 
  _categoryData: UpdateExerciseCategoryData
): Promise<ExerciseCategory> => {
  throw new Error('Exercise categories feature is not yet available. Please apply the migration first.');
};

// Delete an exercise category
export const deleteExerciseCategory = async (_categoryId: string): Promise<void> => {
  throw new Error('Exercise categories feature is not yet available. Please apply the migration first.');
};

// Reorder categories
export const reorderExerciseCategories = async (
  _courseId: string, 
  _categoryIds: string[]
): Promise<void> => {
  throw new Error('Exercise categories feature is not yet available. Please apply the migration first.');
}; 