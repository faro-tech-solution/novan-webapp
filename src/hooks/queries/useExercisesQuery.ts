import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import { Course } from '@/types/course';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';
import { useStableAuth } from '@/hooks/useStableAuth';

export const useExercisesQuery = (courseId?: string) => {
  const { user, isQueryEnabled } = useStableAuth();
  const queryClient = useQueryClient();

  const exercisesQuery = useQuery({
    queryKey: ['exercises', courseId],
    queryFn: async () => {
      if (!user) return [];
      return await fetchExercises(courseId);
    },
    enabled: isQueryEnabled,
    // Use global defaults from react-query.ts
  });

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      return await fetchCourses();
    },
    // Use global defaults from react-query.ts
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
        exercise_type: exerciseData.exercise_type || 'form',
        content_url: exerciseData.content_url,
        auto_grade: exerciseData.auto_grade || false,
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
        exercise_type: data.exercise_type || 'form',
        content_url: data.content_url,
        auto_grade: data.auto_grade || false,
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