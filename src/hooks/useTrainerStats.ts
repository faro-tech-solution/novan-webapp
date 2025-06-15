
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrainerStats {
  totalStudents: number;
  activeExercises: number;
}

export const useTrainerStats = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<TrainerStats>({
    totalStudents: 0,
    activeExercises: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainerStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let totalStudents = 0;
      let activeExercises = 0;

      // Access control based on role
      if (profile?.role === 'admin') {
        // Admins can see all students and exercises
        const { data: studentsData } = await supabase
          .from('course_enrollments')
          .select('student_id')
          .eq('status', 'active');

        const { data: exercisesData } = await supabase
          .from('exercises')
          .select('id');

        totalStudents = studentsData?.length || 0;
        activeExercises = exercisesData?.length || 0;
      } else if (profile?.role === 'trainer') {
        // Trainers can only see students and exercises for their assigned courses
        const { data: assignments } = await supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', user.id);

        if (assignments && assignments.length > 0) {
          const assignedCourseIds = assignments.map(a => a.course_id);

          // Get students enrolled in assigned courses
          const { data: studentsData } = await supabase
            .from('course_enrollments')
            .select('student_id')
            .in('course_id', assignedCourseIds)
            .eq('status', 'active');

          // Get exercises for assigned courses
          const { data: exercisesData } = await supabase
            .from('exercises')
            .select('id')
            .in('course_id', assignedCourseIds);

          totalStudents = studentsData?.length || 0;
          activeExercises = exercisesData?.length || 0;
        }
      }

      setStats({
        totalStudents,
        activeExercises,
      });
    } catch (err) {
      console.error('Error fetching trainer stats:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری آمار');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role) {
      fetchTrainerStats();
    }
  }, [profile?.role]);

  return { stats, loading, error, refetch: fetchTrainerStats };
};
