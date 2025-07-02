import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from '@/hooks/useStableAuth';
import { Database } from '@/integrations/supabase/types';
import { ExerciseWithSubmission, ExerciseData, ExerciseSubmission } from '@/types/exerciseSubmission';
import { CourseEnrollment } from '@/types/course';
import { calculateAdjustedDates } from '@/utils/exerciseDateUtils';
import { calculateSubmissionStatus } from '@/utils/exerciseSubmissionUtils';

// Extended types to match the database schema with the new fields
type ExerciseSubmissionExtended = Database['public']['Tables']['exercise_submissions']['Row'] & {
  auto_graded?: boolean;
  completion_percentage?: number;
};

type ExerciseExtended = Database['public']['Tables']['exercises']['Row'] & {
  courses: Database['public']['Tables']['courses']['Row'];
  exercise_submissions: ExerciseSubmissionExtended[];
  exercise_type?: string;
  auto_grade?: boolean;
};

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
        // Cast the exercise to ExerciseData with the required fields
        const exerciseData: ExerciseData = {
          ...exercise,
          exercise_type: (exercise as any).exercise_type || 'form',
          auto_grade: (exercise as any).auto_grade || false
        };
        
        const dates = calculateAdjustedDates(exerciseData, enrollment as CourseEnrollment);
        
        // Create submission object with all required fields
        const submissionObj = submission ? {
          exercise_id: exercise.id,
          student_id: user.id,
          score: submission.score,
          submitted_at: submission.submitted_at,
          feedback: submission.feedback,
          auto_graded: (submission as any).auto_graded || false,
          completion_percentage: (submission as any).completion_percentage || 0
        } : undefined;
        
        // Cast to ExerciseSubmission
        const submissionStatus = calculateSubmissionStatus(
          submissionObj as ExerciseSubmission | undefined,
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
    enabled: isQueryEnabled,
    // Use global defaults from react-query.ts
  });
}; 