
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Exercise {
  id: string;
  title: string;
  description: string | null;
  course_name: string;
  difficulty: string;
  due_date: string;
  points: number;
  estimated_time: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  submissions?: number;
  total_students?: number;
  average_score?: number;
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching exercises...');

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercises:', error);
        setError(error.message);
        return;
      }

      console.log('Fetched exercises:', data);

      // For each exercise, get submission stats
      const exercisesWithStats = await Promise.all(
        (data || []).map(async (exercise) => {
          const { data: submissions } = await supabase
            .from('exercise_submissions')
            .select('score')
            .eq('exercise_id', exercise.id);

          const submissionCount = submissions?.length || 0;
          const averageScore = submissions && submissions.length > 0
            ? Math.round(submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length)
            : 0;

          return {
            ...exercise,
            submissions: submissionCount,
            total_students: 20, // This should ideally come from course enrollment data
            average_score: averageScore,
          };
        })
      );

      setExercises(exercisesWithStats);
    } catch (err) {
      console.error('Error in fetchExercises:', err);
      setError('خطا در دریافت تمرین‌ها');
    } finally {
      setLoading(false);
    }
  };

  const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      console.log('Creating exercise:', exerciseData);

      const { data, error } = await supabase
        .from('exercises')
        .insert([
          {
            ...exerciseData,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        return { error: error.message };
      }

      console.log('Exercise created successfully:', data);
      await fetchExercises(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error in createExercise:', err);
      return { error: 'خطا در ایجاد تمرین' };
    }
  };

  const deleteExercise = async (id: string) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      console.log('Deleting exercise:', id);

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting exercise:', error);
        return { error: error.message };
      }

      console.log('Exercise deleted successfully');
      await fetchExercises(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error('Error in deleteExercise:', err);
      return { error: 'خطا در حذف تمرین' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchExercises();
    }
  }, [user]);

  return {
    exercises,
    loading,
    error,
    fetchExercises,
    createExercise,
    deleteExercise,
  };
};
