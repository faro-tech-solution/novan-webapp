import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentAwards, checkAndAwardAchievements } from '@/services/awardsService';
import { useMyExercisesQuery } from './useMyExercisesQuery';

interface DashboardStats {
  completedExercises: number;
  pendingExercises: number;
  overdueExercises: number;
  totalPoints: number;
}

export const useTraineeDashboardQuery = () => {
  const { user } = useAuth();
  const { data: myExercises = [], isLoading: exercisesLoading, error: exercisesError } = useMyExercisesQuery();

  const { data: studentAwards = [], isLoading: awardsLoading, error: awardsError } = useQuery({
    queryKey: ['student-awards', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Unauthorized');
      
      // First check for new achievements
      await checkAndAwardAchievements(user.id);
      
      // Then fetch the user's awards
      return await fetchStudentAwards(user.id);
    },
    enabled: !!user,
  });

  // Filter out exercises that will start in the future
  const currentExercises = myExercises.filter(exercise => {
    const today = new Date();
    const openDate = new Date(exercise.open_date);
    return openDate <= today;
  });

  // Get upcoming exercises (not started, due soon) - limit to 3
  const upcomingExercises = currentExercises
    .filter(ex => ex.submission_status === 'not_started')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  // Calculate stats
  const stats: DashboardStats = {
    completedExercises: currentExercises.filter(e => e.submission_status === 'completed').length,
    pendingExercises: currentExercises.filter(e => e.submission_status === 'pending').length,
    overdueExercises: currentExercises.filter(e => e.submission_status === 'overdue').length,
    totalPoints: currentExercises
      .filter(e => e.submission_status === 'completed')
      .reduce((sum, e) => sum + e.points, 0)
  };

  return {
    stats,
    upcomingExercises,
    studentAwards,
    isLoading: exercisesLoading || awardsLoading,
    error: exercisesError || awardsError
  };
}; 