import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { ExerciseWithSubmission, ExerciseData, ExerciseSubmission } from '@/types/exerciseSubmission';
import { CourseEnrollment } from '@/types/course';
import { calculateAdjustedDates } from '@/utils/exerciseDateUtils';
import { calculateSubmissionStatus } from '@/utils/exerciseSubmissionUtils';

type Exercise = Database['public']['Tables']['exercises']['Row'] & {
  courses: Database['public']['Tables']['courses']['Row'];
  exercise_submissions: Database['public']['Tables']['exercise_submissions']['Row'][];
};

export const useMyExercisesQuery = () => {
  const { user } = useAuth();

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
          term_id,
          courses (
            id,
            name
          ),
          course_terms (
            id,
            start_date,
            end_date
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
        .order('created_at', { ascending: false });

      if (exercisesError) {
        throw new Error('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
      }

      if (!exercises) {
        return [];
      }

      // Transform the data to match the expected format
      const transformedExercises: ExerciseWithSubmission[] = exercises.map(exercise => {
        const submission = exercise.exercise_submissions?.[0];
        const enrollment = enrollments.find(e => e.course_id === exercise.course_id);
        const dates = calculateAdjustedDates(exercise as ExerciseData, enrollment as CourseEnrollment);
        const submissionStatus = calculateSubmissionStatus(
          submission ? {
            exercise_id: exercise.id,
            student_id: user.id,
            score: submission.score,
            submitted_at: submission.submitted_at,
            feedback: submission.feedback
          } : undefined,
          dates.adjustedOpenDate,
          dates.adjustedCloseDate
        );

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_id: exercise.course_id,
          course_name: exercise.courses?.name,
          difficulty: exercise.difficulty,
          points: exercise.points,
          estimated_time: exercise.estimated_time,
          open_date: dates.adjustedOpenDate.toISOString(),
          due_date: dates.adjustedDueDate.toISOString(),
          close_date: dates.adjustedCloseDate.toISOString(),
          submission_status: submissionStatus,
          submitted_at: submission?.submitted_at || null,
          score: submission?.score || null,
          feedback: submission?.feedback || null
        };
      });

      return transformedExercises;
    },
    enabled: !!user,
  });
}; 