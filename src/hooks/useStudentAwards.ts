
import { useState, useEffect } from 'react';
import { fetchStudentAwards, checkAndAwardAchievements, StudentAward } from '@/services/awardsService';
import { useAuth } from '@/contexts/AuthContext';

export const useStudentAwards = () => {
  const [studentAwards, setStudentAwards] = useState<StudentAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadAwards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // First check for new achievements
      await checkAndAwardAchievements(user.id);
      
      // Then fetch the awards
      const awards = await fetchStudentAwards(user.id);
      setStudentAwards(awards);
    } catch (err) {
      console.error('Error loading student awards:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری جوایز');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAwards();
  }, [user]);

  const refetch = () => {
    loadAwards();
  };

  return {
    studentAwards,
    loading,
    error,
    refetch
  };
};
