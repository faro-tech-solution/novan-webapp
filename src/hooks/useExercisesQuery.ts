/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
import { 
  useExercisesQuery as useExercisesQueryNew,
} from './queries/useExercisesQuery';

/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
export const useExercisesQuery = (courseId?: string) => {
  console.warn('This hook is deprecated. Use the one from @/hooks/queries/useExercisesQuery instead');
  // Return a consistent interface matching what's expected by consumers
  const { exercises, loading, error } = useExercisesQueryNew(courseId);
  return {
    data: exercises,
    isLoading: loading,
    error
  };
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
export const useCoursesQuery = () => {
  console.warn('This hook is deprecated. Use useExercisesQuery().courses instead');
  const { courses, loading } = useExercisesQueryNew();
  return { data: courses, isLoading: loading };
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
export const useCreateExerciseMutation = () => {
  console.warn('This hook is deprecated. Use useExercisesQuery().createExercise instead');
  const { createExercise, isCreating } = useExercisesQueryNew();
  return { 
    mutateAsync: createExercise,
    isPending: isCreating
  };
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
export const useUpdateExerciseMutation = () => {
  console.warn('This hook is deprecated. Use useExercisesQuery().updateExercise instead');
  // Get the reference to the hook result once during the hook execution
  const { updateExercise } = useExercisesQueryNew();
  
  return { 
    mutateAsync: async ({ exerciseId, exerciseData }: any) => {
      // Transform the parameters to match the expected structure
      return updateExercise({ 
        id: exerciseId, 
        data: exerciseData 
      });
    },
    isPending: useExercisesQueryNew().isUpdating
  };
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useExercisesQuery' instead
 */
export const useDeleteExerciseMutation = () => {
  console.warn('This hook is deprecated. Use useExercisesQuery().deleteExercise instead');
  const { deleteExercise, isDeleting } = useExercisesQueryNew();
  return { 
    mutateAsync: deleteExercise,
    isPending: isDeleting
  };
};