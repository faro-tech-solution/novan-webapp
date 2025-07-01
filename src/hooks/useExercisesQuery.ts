import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, Course } from '@/types/exercise';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';
import { useAuth } from '@/contexts/AuthContext';

export const useExercisesQuery = (courseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exercises', courseId],
    queryFn: () => fetchExercises(courseId),
    enabled: !!user,
  });
};

export const useCoursesQuery = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });
};

export const useCreateExerciseMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (exerciseData: Partial<Exercise>) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      
      return createExercise({
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
};

export const useUpdateExerciseMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ exerciseId, exerciseData }: { exerciseId: string; exerciseData: Partial<Exercise> }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      
      return updateExercise(exerciseId, {
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
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useDeleteExerciseMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      return deleteExercise(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}; 