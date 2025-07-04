/**
 * @deprecated Use hooks from '@/hooks/queries/useMyExercisesQuery' instead
 */
import { useMyExercisesQuery as useMyExercisesQueryNew } from './queries/useMyExercisesQuery';

/**
 * @deprecated Use hooks from '@/hooks/queries/useMyExercisesQuery' instead
 */
export const useMyExercises = () => {
  console.warn('This hook is deprecated. Use the one from @/hooks/queries/useMyExercisesQuery instead');
  const result = useMyExercisesQueryNew();
  return { 
    myExercises: result.data || [], 
    loading: result.isLoading, 
    error: result.error,
    refetch: result.refetch
  };
};
