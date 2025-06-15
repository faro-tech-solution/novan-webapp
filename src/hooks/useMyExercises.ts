
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_name: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  status: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
}

export const useMyExercises = () => {
  const [myExercises, setMyExercises] = useState<ExerciseWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMyExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching exercises for student:', user.id);
      console.log('User role from auth context:', user);

      // First, let's check the user's profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        console.log('User profile:', profile);
      }

      // Let's try to fetch all exercises first to see what's available
      const { data: allExercises, error: allExercisesError } = await supabase
        .from('exercises')
        .select('*');

      if (allExercisesError) {
        console.error('Error fetching all exercises (for debugging):', allExercisesError);
      } else {
        console.log('All exercises in database:', allExercises);
      }

      // Now fetch exercises that the student should be able to see
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      console.log('Query result for active exercises:', { exercises, exercisesError });

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        setError('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
        return;
      }

      if (!exercises || exercises.length === 0) {
        console.log('No exercises found for user');
        setMyExercises([]);
        return;
      }

      console.log('Found exercises:', exercises);

      // Fetch submissions for the current user
      const { data: submissions, error: submissionsError } = await supabase
        .from('exercise_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      } else {
        console.log('User submissions:', submissions);
      }

      // Combine exercises with submission data
      const exercisesWithSubmissions: ExerciseWithSubmission[] = exercises.map(exercise => {
        const submission = submissions?.find(sub => sub.exercise_id === exercise.id);
        
        // Calculate submission status
        let submissionStatus: 'not_started' | 'pending' | 'completed' | 'overdue' = 'not_started';
        const today = new Date();
        const dueDate = new Date(exercise.due_date);
        const openDate = new Date(exercise.open_date);
        const closeDate = new Date(exercise.close_date);

        if (submission) {
          if (submission.score !== null) {
            submissionStatus = 'completed';
          } else {
            submissionStatus = 'pending';
          }
        } else {
          if (today > closeDate) {
            submissionStatus = 'overdue';
          } else if (today >= openDate && today <= closeDate) {
            submissionStatus = 'not_started';
          }
        }

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_name: exercise.course_name,
          difficulty: exercise.difficulty,
          due_date: exercise.due_date,
          open_date: exercise.open_date,
          close_date: exercise.close_date,
          points: exercise.points,
          estimated_time: exercise.estimated_time,
          status: exercise.status,
          submission_status: submissionStatus,
          submitted_at: submission?.submitted_at || null,
          score: submission?.score || null,
          feedback: submission?.feedback || null,
        };
      });

      console.log('Final exercises with submissions:', exercisesWithSubmissions);
      setMyExercises(exercisesWithSubmissions);
    } catch (err) {
      console.error('Error in fetchMyExercises:', err);
      setError('خطا در دریافت تمرین‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyExercises();
    }
  }, [user]);

  return {
    myExercises,
    loading,
    error,
    refetch: fetchMyExercises
  };
};
