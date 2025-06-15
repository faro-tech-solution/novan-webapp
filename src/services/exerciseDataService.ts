
import { supabase } from '@/integrations/supabase/client';
import { CourseEnrollment, ExerciseData, ExerciseSubmission } from '@/types/exerciseSubmission';

export const fetchStudentEnrollments = async (userId: string): Promise<CourseEnrollment[]> => {
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
    .eq('student_id', userId)
    .eq('status', 'active');

  if (enrollmentsError) {
    console.error('Error fetching enrollments:', enrollmentsError);
    throw new Error('خطا در دریافت دوره‌های ثبت‌نام شده: ' + enrollmentsError.message);
  }

  return enrollments || [];
};

export const fetchCourseExercises = async (courseIds: string[]): Promise<ExerciseData[]> => {
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select(`
      id,
      title,
      description,
      course_id,
      difficulty,
      due_date,
      open_date,
      close_date,
      points,
      estimated_time,
      created_at,
      updated_at,
      created_by,
      courses (
        id,
        name
      )
    `)
    .in('course_id', courseIds)
    .order('due_date', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching exercises:', exercisesError);
    throw new Error('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
  }

  return exercises || [];
};

export const fetchStudentSubmissions = async (userId: string): Promise<ExerciseSubmission[]> => {
  const { data: submissions, error: submissionsError } = await supabase
    .from('exercise_submissions')
    .select('*')
    .eq('student_id', userId);

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
    return [];
  }

  return submissions || [];
};
