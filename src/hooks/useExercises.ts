import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, Course } from '@/types/exercise';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';
import { useCache } from './useCache';

export type { Exercise, Course } from '@/types/exercise';

export const useExercises = () => {
  const { user } = useAuth();
  const dataLoadedRef = useRef(false);

  const {
    data: exercises,
    loading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises
  } = useCache<Exercise[]>(
    'exercises',
    async () => {
      if (!user) return [];
      return await fetchExercises();
    },
    { ttl: 5 * 60 * 1000 } // 5 minutes cache
  );

  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses
  } = useCache<Course[]>(
    'courses',
    async () => {
      return await fetchCourses();
    },
    { ttl: 5 * 60 * 1000 } // 5 minutes cache
  );

  const handleCreateExercise = async (exerciseData: Partial<Exercise>) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      const result = await createExercise({
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

      refetchExercises();
      return { data: result };
    } catch (err) {
      console.error('Error in createExercise:', err);
      return { error: 'خطا در ایجاد تمرین' };
    }
  };

  const handleUpdateExercise = async (exerciseId: string, exerciseData: Partial<Exercise>) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      const result = await updateExercise(exerciseId, {
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

      refetchExercises();
      return { data: result };
    } catch (err) {
      console.error('Error in updateExercise:', err);
      return { error: 'خطا در به‌روزرسانی تمرین' };
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      const result = await deleteExercise(id);
      if (!result.error) {
        refetchExercises();
      }
      return result;
    } catch (err) {
      console.error('Error in deleteExercise:', err);
      return { error: 'خطا در حذف تمرین' };
    }
  };

  return {
    exercises: exercises || [],
    courses: courses || [],
    loading: exercisesLoading || coursesLoading,
    error: exercisesError || coursesError,
    fetchExercises: refetchExercises,
    fetchCourses: refetchCourses,
    createExercise: handleCreateExercise,
    updateExercise: handleUpdateExercise,
    deleteExercise: handleDeleteExercise,
  };
};
