import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, Course } from '@/types/exercise';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';
import { useAuth } from '@/contexts/AuthContext';

export const useExercisesQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      if (!user) return [];
      return await fetchExercises();
    },
    enabled: !!user,
  });

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      return await fetchCourses();
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: Partial<Exercise>) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await createExercise({
        title: exerciseData.title || '',
        description: exerciseData.description,
        difficulty: exerciseData.difficulty || '',
        estimatedTime: exerciseData.estimated_time || '',
        points: exerciseData.points || 0,
        courseId: exerciseData.course_id || '',
        daysToOpen: exerciseData.days_to_open || 0,
        daysToDue: exerciseData.days_to_due || 0,
        daysToClose: exerciseData.days_to_close || 0,
        formStructure: exerciseData.form_structure || { questions: [] }
      }, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exercise> }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await updateExercise(id, {
        title: data.title || '',
        description: data.description,
        difficulty: data.difficulty || '',
        estimatedTime: data.estimated_time || '',
        points: data.points || 0,
        courseId: data.course_id || '',
        daysToOpen: data.days_to_open || 0,
        daysToDue: data.days_to_due || 0,
        daysToClose: data.days_to_close || 0,
        formStructure: data.form_structure || { questions: [] }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await deleteExercise(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  return {
    exercises: exercisesQuery.data || [],
    courses: coursesQuery.data || [],
    loading: exercisesQuery.isLoading || coursesQuery.isLoading,
    error: exercisesQuery.error || coursesQuery.error,
    createExercise: createExerciseMutation.mutateAsync,
    updateExercise: updateExerciseMutation.mutateAsync,
    deleteExercise: deleteExerciseMutation.mutateAsync,
    isCreating: createExerciseMutation.isPending,
    isUpdating: updateExerciseMutation.isPending,
    isDeleting: deleteExerciseMutation.isPending,
  };
}; 