
import { supabase } from '@/integrations/supabase/client';
import { ExerciseData, ExerciseSubmission as ExerciseSubmissionLegacy } from '@/types/exerciseSubmission';
// Add course enrollment type
interface CourseEnrollment {
  course_id: string;
  enrolled_at: string;
  student_id: string;
  course_terms: {
    id: string;
    start_date: string;
    end_date: string;
  }[];
}

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

  // Convert to the required type with unknown conversion
  return (enrollments || []) as unknown as CourseEnrollment[];
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
      days_to_due,
      days_to_open,
      days_to_close,
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
    .order('days_to_due', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching exercises:', exercisesError);
    throw new Error('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
  }

  return (exercises || []) as unknown as ExerciseData[];
};

export const fetchStudentSubmissions = async (userId: string): Promise<ExerciseSubmissionLegacy[]> => {
  const { data: submissions, error: submissionsError } = await supabase
    .from('exercise_submissions')
    .select('*')
    .eq('student_id', userId);

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
    return [];
  }

  return (submissions || []) as unknown as ExerciseSubmissionLegacy[];
};
