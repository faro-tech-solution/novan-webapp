import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from '@/hooks/useStableAuth';



export const useMyExercisesQuery = () => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['myExercises', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch enrollments with term information
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          enrolled_at,
          courses (
            id,
            name
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        throw new Error('خطا در دریافت دوره‌های ثبت‌نام شده: ' + enrollmentsError.message);
      }

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      // Extract course IDs from enrollments
      const enrolledCourseIds = enrollments
        .filter(enrollment => enrollment.courses)
        .map(enrollment => enrollment.course_id);

      if (enrolledCourseIds.length === 0) {
        return [];
      }

      // Fetch exercises for enrolled courses
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          *,
          courses (
            id,
            name
          ),
          exercise_categories (
            id,
            name,
            description
          ),
          exercise_submissions (
            id,
            score,
            submitted_at,
            feedback,
            graded_at,
            graded_by,
            solution,
            student_id
          )
        `)
        .in('course_id', enrolledCourseIds)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (exercisesError) {
        throw new Error('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
      }

      if (!exercises) {
        return [];
      }

      // Transform the data to match the expected format
      const transformedExercises = exercises.map(exercise => {
        const submission = exercise.exercise_submissions?.[0];
        // Determine submission status
        const submissionStatus: 'not_started' | 'pending' | 'completed' = submission ? 'completed' : 'not_started';

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_id: exercise.course_id,
          course_name: exercise.courses?.name,
          category_id: (exercise as any).category_id,
          category_name: (exercise as any).exercise_categories?.name,
          difficulty: exercise.difficulty,
          points: exercise.points,
          estimated_time: exercise.estimated_time,
          score: submission?.score || null,
          submission_status: submissionStatus,
          exercise_type: (exercise as any).exercise_type || 'form',
          auto_grade: (exercise as any).auto_grade || false,
          content_url: (exercise as any).content_url || null,
          order_index: (exercise as any).order_index,
          created_at: exercise.created_at,
        };
      });

      return transformedExercises;
    },
    enabled: isQueryEnabled,
    // Use global defaults from react-query.ts
  });
}; 