
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Exercise {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  submissions?: number;
  total_students?: number;
  average_score?: number;
  exercise_status?: 'upcoming' | 'active' | 'overdue' | 'closed';
  course_name?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor_name: string;
  status: string;
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const calculateExerciseStatus = (exercise: Exercise): 'upcoming' | 'active' | 'overdue' | 'closed' => {
    const today = new Date();
    const openDate = new Date(exercise.open_date);
    const closeDate = new Date(exercise.close_date);
    
    if (today < openDate) {
      return 'upcoming';
    } else if (today >= openDate && today <= closeDate) {
      return 'active';
    } else {
      return 'overdue';
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');

      const { data, error } = await supabase
        .from('courses')
        .select('id, name, instructor_name, status')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      console.log('Fetched courses:', data);
      setCourses(data || []);
    } catch (err) {
      console.error('Error in fetchCourses:', err);
    }
  };

  const fetchExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching exercises...');

      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          courses (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercises:', error);
        setError(error.message);
        return;
      }

      console.log('Fetched exercises:', data);

      // For each exercise, get submission stats and calculate status
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

          const exerciseWithStats: Exercise = {
            ...exercise,
            course_name: exercise.courses?.name || 'نامشخص',
            submissions: submissionCount,
            total_students: 20, // This should ideally come from course enrollment data
            average_score: averageScore,
            exercise_status: calculateExerciseStatus(exercise),
          };

          return exerciseWithStats;
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

  const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'submissions' | 'total_students' | 'average_score' | 'exercise_status' | 'course_name'>) => {
    if (!user) return { error: 'کاربر وارد نشده است' };

    try {
      console.log('Creating exercise:', exerciseData);

      // Find the course by name to get the course_id
      const selectedCourse = courses.find(course => course.name === exerciseData.course_id);
      if (!selectedCourse) {
        return { error: 'دوره انتخاب شده یافت نشد' };
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert([
          {
            ...exerciseData,
            course_id: selectedCourse.id,
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
      fetchCourses();
      fetchExercises();
    }
  }, [user]);

  return {
    exercises,
    courses,
    loading,
    error,
    fetchExercises,
    fetchCourses,
    createExercise,
    deleteExercise,
  };
};
