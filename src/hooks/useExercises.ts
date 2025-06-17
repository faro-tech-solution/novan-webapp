import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise, Course } from '@/types/exercise';
import { fetchCourses, fetchExercises, createExercise, updateExercise, deleteExercise } from '@/services/exerciseService';

export type { Exercise, Course } from '@/types/exercise';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const dataLoadedRef = useRef(false);

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
      dataLoadedRef.current = true;
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
      console.log('Creating exercise with data:', exerciseData);
      const result = await createExercise({
        title: exerciseData.title,
        description: exerciseData.description,
        difficulty: exerciseData.difficulty,
        estimatedTime: exerciseData.estimated_time,
        points: exerciseData.points,
        courseId: exerciseData.course_id,
        daysToOpen: exerciseData.days_to_open,
        daysToDue: exerciseData.days_to_due,
        daysToClose: exerciseData.days_to_close,
        formStructure: exerciseData.form_structure || { questions: [] }
      }, user.id);

      console.log('Exercise created:', result);
      setExercises(prev => [result, ...prev]);
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

      setExercises(prev => prev.map(ex => 
        ex.id === exerciseId ? result : ex
      ));
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
        setExercises(prev => prev.filter(ex => ex.id !== id));
      }
      return result;
    } catch (err) {
      console.error('Error in deleteExercise:', err);
      return { error: 'خطا در حذف تمرین' };
    }
  };

  useEffect(() => {
    if (user && !dataLoadedRef.current) {
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
    updateExercise: handleUpdateExercise,
    deleteExercise: handleDeleteExercise,
  };
};
