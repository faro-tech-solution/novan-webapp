import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getWeeklyActivityStats, calculateActivityStreak, fetchStudentActivityLogs } from '@/services/activityLogService';
import { fetchStudentAwards, fetchAllAwards, checkAndAwardAchievements } from '@/services/awardsService';
import { useMyExercisesQuery } from './useMyExercisesQuery';

export interface ProgressStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalHours: number;
  currentStreak: number;
  totalPoints: number;
  weeklyPointsActivity: Array<{ day: string; points: number }>;
}

export const useProgressStatsQuery = () => {
  const { user } = useAuth();
  const { data: myExercises = [] } = useMyExercisesQuery();
  const { data: studentAwards = [] } = useStudentAwardsQuery();

  return useQuery({
    queryKey: ['progress-stats', user?.id, myExercises.length, studentAwards.length],
    queryFn: async () => {
      if (!user) throw new Error('Unauthorized');

      const completedExercises = myExercises.filter(ex => ex.submission_status === 'completed');
      const totalExercises = myExercises.length;
      
      // Since 'score' does not exist on the exercise type, use 'points' instead for averageScore
      const averageScore = completedExercises.length > 0 
        ? Math.round(completedExercises.reduce((sum, ex) => sum + ("points" in ex && typeof (ex as any).points === 'number' ? (ex as any).points : 0), 0) / completedExercises.length)
        : 0;

      // Calculate total hours (estimated time for completed exercises)
      const totalHours = completedExercises.reduce((sum, ex) => {
        const timeStr = ex.estimated_time || '0';
        const hours = parseFloat(timeStr.replace(/[^\d.]/g, '')) || 0;
        return sum + hours;
      }, 0);

      // Calculate total points from activity logs
      const activityLogs = await fetchStudentActivityLogs(user.id);
      const totalPoints = activityLogs.reduce((sum, activity) => sum + (activity.points_earned || 0), 0);

      // Calculate streak and weekly activity
      const currentStreak = await calculateActivityStreak(user.id);
      const weeklyPointsActivity = await getWeeklyActivityStats(user.id);

      return {
        totalExercises,
        completedExercises: completedExercises.length,
        averageScore,
        totalHours: Math.round(totalHours),
        currentStreak,
        totalPoints,
        weeklyPointsActivity
      } as ProgressStats;
    },
    enabled: !!user,
  });
};

export const useStudentAwardsQuery = () => {
  const { user } = useAuth();

  return useQuery({
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
};

export const useAllAwardsQuery = () => {
  return useQuery({
    queryKey: ['all-awards'],
    queryFn: async () => {
      return await fetchAllAwards();
    },
  });
}; 