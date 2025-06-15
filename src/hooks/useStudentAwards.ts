
import { useState, useEffect } from 'react';
import { fetchStudentAwards, fetchAllAwards, checkAndAwardAchievements, StudentAward, Award } from '@/services/awardsService';
import { useAuth } from '@/contexts/AuthContext';

export const useStudentAwards = () => {
  const [studentAwards, setStudentAwards] = useState<StudentAward[]>([]);
  const [allAwards, setAllAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all available awards
      const awards = await fetchAllAwards();
      setAllAwards(awards);
      
      if (user) {
        // First check for new achievements
        await checkAndAwardAchievements(user.id);
        
        // Then fetch the user's awards
        const userAwards = await fetchStudentAwards(user.id);
        setStudentAwards(userAwards);
      }
    } catch (err) {
      console.error('Error loading awards:', err);
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
    allAwards,
    loading,
    error,
    refetch
  };
};
