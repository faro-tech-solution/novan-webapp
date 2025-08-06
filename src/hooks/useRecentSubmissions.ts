
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentSubmission {
  id: string;
  student: string;
  exercise: string;
  submitted: string;
  score: number | null;
  exercise_id: string;
}

export const useRecentSubmissions = () => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('exercise_submissions')
        .select(`
          id,
          score,
          submitted_at,
          exercise_id,
          student:profiles!exercise_submissions_student_id_fkey(
            first_name,
            last_name
          ),
          exercises!inner(
            title,
            course_id,
            courses!inner(
              name,
              instructor_id
            )
          )
        `)
        .is('score', null) // Only show submissions without scores (not completed)
        .order('submitted_at', { ascending: false })
        .limit(10);

      // Access control based on role
      if (profile?.role === 'admin') {
        // Admins can see all submissions - no additional filter needed
      } else if (profile?.role === 'trainer') {
        // Trainers can only see submissions for their assigned courses
        const { data: assignments } = await supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', user.id);

        if (assignments && assignments.length > 0) {
          const assignedCourseIds = assignments.map(a => a.course_id);
          // Filter by courses that the trainer is assigned to
          query = query.in('exercises.course_id', assignedCourseIds);
        } else {
          // No assignments, return empty array
          setSubmissions([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const transformedSubmissions: RecentSubmission[] = (data || [])
        .filter(submission => typeof submission === 'object' && submission !== null && 'submitted_at' in submission && typeof (submission as any).submitted_at === 'string')
        .map(submission => {
          const s = submission as { submitted_at: string; [key: string]: any };
          const timeAgo = getTimeAgo(new Date(s.submitted_at));
          return {
            id: s.id,
            student: s.student_name,
            exercise: s.exercises?.title || 'نامشخص',
            submitted: timeAgo,
            score: s.score,
            exercise_id: s.exercise_id
          };
        });

      setSubmissions(transformedSubmissions);
    } catch (err) {
      console.error('Error fetching recent submissions:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری ارسال‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSubmissions();
  }, [profile?.role]);

  return { submissions, loading, error, refetch: fetchRecentSubmissions };
};

// Helper function to calculate time ago in Persian
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} دقیقه پیش`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ساعت پیش`;
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days} روز پیش`;
  }
};
