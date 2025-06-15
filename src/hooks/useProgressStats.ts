
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyExercises } from '@/hooks/useMyExercises';
import { useStudentAwards } from '@/hooks/useStudentAwards';
import { getWeeklyActivityStats, calculateActivityStreak } from '@/services/activityLogService';

interface ProgressStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalHours: number;
  currentStreak: number;
  rank: number;
  totalStudents: number;
  totalPoints: number;
  weeklyPointsActivity: Array<{ day: string; points: number }>;
}

export const useProgressStats = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { myExercises, loading: exercisesLoading } = useMyExercises();
  const { studentAwards, loading: awardsLoading } = useStudentAwards();

  const calculateWeeklyPointsActivity = async () => {
    if (!user) return [];

    try {
      // Use the new activity logging system for weekly activity
      console.log('Fetching weekly activity stats from activity logs...');
      const activityStats = await getWeeklyActivityStats(user.id);
      
      if (activityStats.length > 0) {
        console.log('Using activity logs for weekly stats:', activityStats);
        return activityStats;
      }

      // Fallback to old calculation if no activity logs found
      console.log('No activity logs found, falling back to submission-based calculation...');
      return calculateLegacyWeeklyActivity();
    } catch (err) {
      console.error('Error fetching activity stats, using fallback:', err);
      return calculateLegacyWeeklyActivity();
    }
  };

  const calculateLegacyWeeklyActivity = () => {
    const today = new Date();
    const weeklyActivity = [];
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    
    // Calculate for the past 7 days using old method
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      // Get points from completed exercises on this day
      const exercisePoints = myExercises
        .filter(ex => {
          if (ex.submission_status !== 'completed' || !ex.submitted_at) return false;
          const submissionDate = new Date(ex.submitted_at);
          return submissionDate >= date && submissionDate < nextDay;
        })
        .reduce((sum, ex) => sum + (ex.points || 0), 0);
      
      // Get bonus points from awards earned on this day
      const awardPoints = studentAwards
        .filter(award => {
          const earnedDate = new Date(award.earned_at);
          earnedDate.setHours(0, 0, 0, 0);
          return earnedDate.getTime() === date.getTime();
        })
        .reduce((sum, award) => sum + award.bonus_points, 0);
      
      const totalDayPoints = exercisePoints + awardPoints;
      const dayName = dayNames[date.getDay()];
      
      weeklyActivity.push({
        day: dayName,
        points: totalDayPoints
      });
    }
    
    return weeklyActivity;
  };

  const calculateStats = async () => {
    if (exercisesLoading || awardsLoading || !myExercises) return;

    try {
      const completedExercises = myExercises.filter(ex => ex.submission_status === 'completed');
      const totalExercises = myExercises.length;
      
      const averageScore = completedExercises.length > 0 
        ? Math.round(completedExercises.reduce((sum, ex) => sum + (ex.score || 0), 0) / completedExercises.length)
        : 0;

      // Calculate total hours (estimated time for completed exercises)
      const totalHours = completedExercises.reduce((sum, ex) => {
        const timeStr = ex.estimated_time || '0';
        const hours = parseFloat(timeStr.replace(/[^\d.]/g, '')) || 0;
        return sum + hours;
      }, 0);

      // Calculate total points including bonus points from awards
      const exercisePoints = completedExercises.reduce((sum, ex) => sum + (ex.points || 0), 0);
      const bonusPoints = studentAwards.reduce((sum, award) => sum + award.bonus_points, 0);
      const totalPoints = exercisePoints + bonusPoints;

      // Use new activity-based streak calculation
      const currentStreak = user ? await calculateActivityStreak(user.id) : 0;
      const weeklyPointsActivity = await calculateWeeklyPointsActivity();

      setStats({
        totalExercises,
        completedExercises: completedExercises.length,
        averageScore,
        totalHours: Math.round(totalHours),
        currentStreak,
        rank: 3, // This would need class-wide data to calculate properly
        totalStudents: 25, // This would need class-wide data
        totalPoints,
        weeklyPointsActivity
      });
    } catch (err) {
      console.error('Error calculating progress stats:', err);
      setError('خطا در محاسبه آمار پیشرفت');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!exercisesLoading && !awardsLoading) {
      calculateStats();
    }
  }, [myExercises, studentAwards, exercisesLoading, awardsLoading, user]);

  return {
    stats,
    loading: loading || exercisesLoading || awardsLoading,
    error,
    refetch: calculateStats
  };
};
