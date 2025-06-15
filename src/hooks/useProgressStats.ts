
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyExercises } from '@/hooks/useMyExercises';
import { useStudentAwards } from '@/hooks/useStudentAwards';

interface ProgressStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalHours: number;
  currentStreak: number;
  rank: number;
  totalStudents: number;
  totalPoints: number;
}

export const useProgressStats = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { myExercises, loading: exercisesLoading } = useMyExercises();
  const { studentAwards, loading: awardsLoading } = useStudentAwards();

  const calculateCurrentStreak = () => {
    const submissions = myExercises
      .filter(ex => ex.submission_status === 'completed' && ex.submitted_at)
      .sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime());

    if (submissions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's a submission today or yesterday
    const latestSubmission = new Date(submissions[0].submitted_at!);
    latestSubmission.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - latestSubmission.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken if more than 1 day gap
    
    // Count consecutive days backwards
    const submissionDates = new Set(
      submissions.map(sub => {
        const date = new Date(sub.submitted_at!);
        return date.toISOString().split('T')[0];
      })
    );

    let checkDate = new Date(latestSubmission);
    while (submissionDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const calculateStats = () => {
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

      const currentStreak = calculateCurrentStreak();

      setStats({
        totalExercises,
        completedExercises: completedExercises.length,
        averageScore,
        totalHours: Math.round(totalHours),
        currentStreak,
        rank: 3, // This would need class-wide data to calculate properly
        totalStudents: 25, // This would need class-wide data
        totalPoints
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
  }, [myExercises, studentAwards, exercisesLoading, awardsLoading]);

  return {
    stats,
    loading: loading || exercisesLoading || awardsLoading,
    error,
    refetch: calculateStats
  };
};
