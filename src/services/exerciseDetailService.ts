
import { supabase } from '@/integrations/supabase/client';
import { calculateAdjustedDates } from '@/utils/exerciseDateUtils';
import { calculateSubmissionStatus } from '@/utils/exerciseSubmissionUtils';

export interface ExerciseDetail {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_name: string;
  difficulty: string;
  days_to_due: number;
  days_to_open: number;
  days_to_close: number;
  points: number;
  estimated_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  open_date: string;
  due_date: string;
  close_date: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
  solution: string | null;
}

export const fetchExerciseDetail = async (exerciseId: string, userId: string): Promise<ExerciseDetail | null> => {
  console.log('Fetching exercise detail for:', exerciseId, 'user:', userId);

  // Fetch exercise data
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .select(`
      *,
      courses (
        id,
        name
      )
    `)
    .eq('id', exerciseId)
    .single();

  if (exerciseError) {
    console.error('Error fetching exercise:', exerciseError);
    throw new Error('خطا در دریافت اطلاعات تمرین: ' + exerciseError.message);
  }

  if (!exercise) {
    return null;
  }

  // Fetch user's enrollment for this course to get term information
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('course_enrollments')
    .select(`
      course_id,
      enrolled_at,
      term_id,
      course_terms (
        id,
        start_date,
        end_date
      )
    `)
    .eq('student_id', userId)
    .eq('course_id', exercise.course_id)
    .eq('status', 'active')
    .single();

  if (enrollmentError) {
    console.error('Error fetching enrollment:', enrollmentError);
    // Don't throw error, user might not be enrolled but still viewing exercise
  }

  // Create a minimal enrollment object for calculateAdjustedDates
  const enrollmentForCalculation = enrollment ? {
    ...enrollment,
    courses: null // This property is not used in date calculations
  } : undefined;

  // Calculate adjusted dates
  const { adjustedOpenDate, adjustedDueDate, adjustedCloseDate } = calculateAdjustedDates(exercise, enrollmentForCalculation);

  // Fetch user's submission for this exercise
  const { data: submission, error: submissionError } = await supabase
    .from('exercise_submissions')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('student_id', userId)
    .single();

  if (submissionError && submissionError.code !== 'PGRST116') {
    console.error('Error fetching submission:', submissionError);
  }

  // Calculate submission status
  const submissionStatus = calculateSubmissionStatus(submission, adjustedOpenDate, adjustedCloseDate);

  return {
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    course_id: exercise.course_id,
    course_name: exercise.courses?.name || 'نامشخص',
    difficulty: exercise.difficulty,
    days_to_due: exercise.days_to_due,
    days_to_open: exercise.days_to_open,
    days_to_close: exercise.days_to_close,
    points: exercise.points,
    estimated_time: exercise.estimated_time,
    created_at: exercise.created_at,
    updated_at: exercise.updated_at,
    created_by: exercise.created_by,
    open_date: adjustedOpenDate.toISOString().split('T')[0],
    due_date: adjustedDueDate.toISOString().split('T')[0],
    close_date: adjustedCloseDate.toISOString().split('T')[0],
    submission_status: submissionStatus,
    submitted_at: submission?.submitted_at || null,
    score: submission?.score || null,
    feedback: submission?.feedback || null,
    solution: submission?.solution || null,
  };
};

export const submitExerciseSolution = async (
  exerciseId: string,
  userId: string,
  userEmail: string,
  userName: string,
  solution: string
): Promise<{ error: string | null }> => {
  console.log('Submitting solution for exercise:', exerciseId);

  const { error } = await supabase
    .from('exercise_submissions')
    .upsert({
      exercise_id: exerciseId,
      student_id: userId,
      student_email: userEmail,
      student_name: userName,
      solution: solution,
      submitted_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error submitting solution:', error);
    return { error: error.message };
  }

  console.log('Solution submitted successfully');
  return { error: null };
};
