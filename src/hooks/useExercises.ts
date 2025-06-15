
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, Course } from '@/types/exercise';
import { fetchCourses, fetchExercises, createExercise, deleteExercise } from '@/services/exerciseService';

export type { Exercise, Course } from '@/types/exercise';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFetchCourses = async () => {
    try {
      const coursesData = await fetchCourses();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error in fetchCourses:', err);
    }
  };

  const handleFetchExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const exercisesData = await fetchExercises();
      setExercises(exercisesData);
    } catch (err) {
      console.error('Error in fetchExercises:', err);
      setError('خطا در دریافت تمرین‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'submissions' | 'total_students' | 'average_score' | 'exercise_status' | 'course_name'>) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      const result = await createExercise(exerciseData, user.id, courses);
      if (!result.error) {
        await handleFetchExercises(); // Refresh the list
      }
      return result;
    } catch (err) {
      console.error('Error in createExercise:', err);
      return { error: 'خطا در ایجاد تمرین' };
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      const result = await deleteExercise(id);
      if (!result.error) {
        await handleFetchExercises(); // Refresh the list
      }
      return result;
    } catch (err) {
      console.error('Error in deleteExercise:', err);
      return { error: 'خطا در حذف تمرین' };
    }
  };

  useEffect(() => {
    if (user) {
      handleFetchCourses();
      handleFetchExercises();
    }
  }, [user]);

  return {
    exercises,
    courses,
    loading,
    error,
    fetchExercises: handleFetchExercises,
    fetchCourses: handleFetchCourses,
    createExercise: handleCreateExercise,
    deleteExercise: handleDeleteExercise,
  };
};
