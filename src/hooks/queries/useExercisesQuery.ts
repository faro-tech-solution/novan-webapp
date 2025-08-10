import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';
import { reorderExercises } from '@/services/exerciseReorderService';
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
    mutationFn: async (exerciseData: Partial<Exercise> & { arvan_video_id?: string }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await createExercise({
        title: exerciseData.title || '',
        description: exerciseData.description || undefined,
        difficulty: exerciseData.difficulty || null,
        estimatedTime: String(exerciseData.estimated_time ?? 0),
        points: exerciseData.points || 0,
        courseId: exerciseData.course_id || '',
        category_id: exerciseData.category_id || null,

        exercise_type: exerciseData.exercise_type || 'form',
        content_url: exerciseData.content_url,
        iframe_html: exerciseData.iframe_html,
        auto_grade: exerciseData.auto_grade || false,
        formStructure:
          exerciseData.form_structure &&
          typeof exerciseData.form_structure === 'object' &&
          Array.isArray((exerciseData.form_structure as any).questions)
            ? (exerciseData.form_structure as ExerciseForm)
            : { questions: [] },
        
        arvan_video_id: exerciseData.arvan_video_id
      }, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exercise> & { arvan_video_id?: string } }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await updateExercise(id, {
        title: data.title || '',
        description: data.description || undefined,
        difficulty: data.difficulty || null,
        estimatedTime: String(data.estimated_time ?? 0),
        points: data.points || 0,
        courseId: data.course_id || '',
        category_id: data.category_id || null,

        exercise_type: data.exercise_type || 'form',
        content_url: data.content_url,
        iframe_html: data.iframe_html,
        auto_grade: data.auto_grade || false,
        formStructure:
          data.form_structure &&
          typeof data.form_structure === 'object' &&
          Array.isArray((data.form_structure as any).questions)
            ? (data.form_structure as ExerciseForm)
            : { questions: [] },

        arvan_video_id: data.arvan_video_id
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

  const reorderExercisesMutation = useMutation({
    mutationFn: async (reorderData: { exerciseId: string; newOrderIndex: number; courseId: string; categoryId?: string | null }[]) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return await reorderExercises(reorderData);
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
    reorderExercises: reorderExercisesMutation.mutateAsync,
    isCreating: createExerciseMutation.isPending,
    isUpdating: updateExerciseMutation.isPending,
    isDeleting: deleteExerciseMutation.isPending,
    isReordering: reorderExercisesMutation.isPending,
  };
}; 