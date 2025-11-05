import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentAwards, checkAndAwardAchievements } from '@/services/awardsService';
import { useMyExercisesQuery } from './useMyExercisesQuery';

interface DashboardStats {
  completedExercises: number;
  pendingExercises: number;
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

  // Get incomplete exercises (not completed) - limit to 3
  // RLS policies automatically filter out disabled exercises for trainees
  const incompleteExercises = myExercises
    .filter(ex => ex.submission_status !== 'completed')
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 3);

  // Calculate stats
  const stats: DashboardStats = {
    completedExercises: myExercises.filter(e => e.submission_status === 'completed').length,
    pendingExercises: 0,
    totalPoints: myExercises
      .filter(e => e.submission_status === 'completed')
      .reduce((sum, e) => sum + e.points, 0)
  };

  return {
    stats,
    incompleteExercises,
    studentAwards,
    isLoading: exercisesLoading || awardsLoading,
    error: exercisesError || awardsError
  };
}; 