
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  completedExercises: number;
  pendingExercises: number;
  overdueExercises: number;
  totalPoints: number;
}

interface UpcomingExercise {
  id: string;
  title: string;
  description: string | null;
  course_name: string;
  difficulty: string;

  estimated_time: string;
  points: number;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
}

export const useTraineeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    completedExercises: 0,
    pendingExercises: 0,
    overdueExercises: 0,
    totalPoints: 0
  });
  const [upcomingExercises, setUpcomingExercises] = useState<UpcomingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching dashboard data for user:', user.id);

      // Fetch student enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          enrolled_at,
          term_id,
          courses (
            id,
            name
          ),
          course_terms (
            id,
            start_date,
            end_date
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw new Error('خطا در دریافت دوره‌های ثبت‌نام شده');
      }

      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found');
        setStats({
          completedExercises: 0,
          pendingExercises: 0,
          overdueExercises: 0,
          totalPoints: 0
        });
        setUpcomingExercises([]);
        return;
      }

      const enrolledCourseIds = enrollments
        .filter(enrollment => enrollment.courses)
        .map(enrollment => enrollment.course_id);

      // Fetch exercises for enrolled courses
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          id,
          title,
          description,
          course_id,
          difficulty,

          points,
          estimated_time,
          created_at,
          courses (
            id,
            name
          )
        `)
        .in('course_id', enrolledCourseIds)
        .order('sort', { ascending: true })
        .order('created_at', { ascending: true });

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        throw new Error('خطا در دریافت تمرین‌ها');
      }

      // Fetch user submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('exercise_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      }

      // Process data
      const now = new Date();
      const processedExercises: UpcomingExercise[] = [];
      let completedCount = 0;
      const pendingCount = 0;
      let overdueCount = 0;
      let totalPoints = 0;

      exercises?.forEach(exercise => {

        const submission = submissions?.find(sub => sub.exercise_id === exercise.id);
        
        let submissionStatus: 'not_started' | 'pending' | 'completed' | 'overdue';
        if (submission) {
          submissionStatus = 'completed';
          completedCount++;
          totalPoints += exercise.points;
        } else {
          submissionStatus = 'not_started';
        }

        processedExercises.push({
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_name: exercise.courses?.name || 'نامشخص',
          difficulty: exercise.difficulty,

          estimated_time: exercise.estimated_time,
          points: exercise.points,
          submission_status: submissionStatus
        });
      });

      // Get upcoming exercises (not started, due soon)
      const upcoming = processedExercises
        .filter(ex => ex.submission_status === 'not_started')
        .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime())
        .slice(0, 3);

      setStats({
        completedExercises: completedCount,
        pendingExercises: pendingCount,
        overdueExercises: overdueCount,
        totalPoints: totalPoints
      });
      setUpcomingExercises(upcoming);

    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات داشبورد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return {
    stats,
    upcomingExercises,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
