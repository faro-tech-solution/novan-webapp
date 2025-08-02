import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchExerciseCategories, 
  createExerciseCategory, 
  updateExerciseCategory, 
  deleteExerciseCategory,
  reorderExerciseCategories,
  CreateExerciseCategoryData,
  UpdateExerciseCategoryData
} from '@/services/exerciseCategoryService';
import { useStableAuth } from '@/hooks/useStableAuth';

export const useExerciseCategoriesQuery = (courseId: string) => {
  const { user, isQueryEnabled } = useStableAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['exercise-categories', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      return await fetchExerciseCategories(courseId);
    },
    enabled: isQueryEnabled && !!courseId,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CreateExerciseCategoryData) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await createExerciseCategory(categoryData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-categories', courseId] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ 
      categoryId, 
      categoryData 
    }: { 
      categoryId: string; 
      categoryData: UpdateExerciseCategoryData 
    }) => {
      return await updateExerciseCategory(categoryId, categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-categories', courseId] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await deleteExerciseCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-categories', courseId] });
    },
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      return await reorderExerciseCategories(courseId, categoryIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-categories', courseId] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    loading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    reorderCategories: reorderCategoriesMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    isReordering: reorderCategoriesMutation.isPending,
  };
}; 