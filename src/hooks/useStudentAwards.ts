
import { useState, useEffect } from 'react';
import { fetchStudentAwards, fetchAllAwards, checkAndAwardAchievements, Award } from '@/services/awardsService';
import { StudentAward } from '@/types/student';
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
        try {
          // First check for new achievements
          console.log('Checking for new achievements for user:', user.id);
          await checkAndAwardAchievements(user.id);
          console.log('Achievement check completed successfully');
        } catch (achievementError) {
          console.error('Achievement check failed:', achievementError);
          // Don't fail the whole load if just achievement checking fails
        }
        
        // Then fetch the user's awards
        console.log('Fetching awards for user:', user.id);
        const userAwards = await fetchStudentAwards(user.id);
        console.log('Fetched user awards:', userAwards.length);
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
