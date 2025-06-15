
import { supabase } from '@/integrations/supabase/client';
import { Exercise, Course } from '@/types/exercise';
import { calculateExerciseStatus } from '@/utils/exerciseUtils';

export const fetchCourses = async (): Promise<Course[]> => {
  console.log('Fetching courses...');

  const { data, error } = await supabase
    .from('courses')
    .select('id, name, instructor_name, status')
    .order('name');

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  console.log('Fetched courses:', data);
  return data || [];
};

export const fetchExercises = async (): Promise<Exercise[]> => {
  console.log('Fetching exercises...');

  const { data, error } = await supabase
    .from('exercises')
    .select(`
      *,
      courses (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }

  console.log('Fetched exercises:', data);

  // For each exercise, get submission stats and calculate status
  const exercisesWithStats = await Promise.all(
    (data || []).map(async (exercise) => {
      // Get submissions for this exercise
      const { data: submissions, error: submissionsError } = await supabase
        .from('exercise_submissions')
        .select('score, student_id')
        .eq('exercise_id', exercise.id);

      if (submissionsError) {
        console.error('Error fetching submissions for exercise:', exercise.id, submissionsError);
      }

      // Get total enrolled students for this course
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('student_id')
        .eq('course_id', exercise.course_id)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('Error fetching enrollments for course:', exercise.course_id, enrollmentsError);
      }

      const submissionCount = submissions?.length || 0;
      const totalStudents = enrollments?.length || 0;
      
      // Calculate average score from submissions that have scores
      const scoredSubmissions = submissions?.filter(sub => sub.score !== null && sub.score !== undefined) || [];
      const averageScore = scoredSubmissions.length > 0
        ? Math.round(scoredSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / scoredSubmissions.length)
        : 0;

      console.log(`Exercise ${exercise.title}: ${submissionCount} submissions, ${totalStudents} total students, ${averageScore}% average`);

      const exerciseWithStats: Exercise = {
        ...exercise,
        course_name: exercise.courses?.name || 'نامشخص',
        submissions: submissionCount,
        total_students: totalStudents,
        average_score: averageScore,
        exercise_status: calculateExerciseStatus(exercise),
      };

      return exerciseWithStats;
    })
  );

  return exercisesWithStats;
};

export const createExercise = async (
  exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'submissions' | 'total_students' | 'average_score' | 'exercise_status' | 'course_name'>,
  userId: string,
  courses: Course[]
): Promise<{ data?: Exercise; error: string | null }> => {
  console.log('Creating exercise:', exerciseData);

  // Find the course by name to get the course_id
  const selectedCourse = courses.find(course => course.name === exerciseData.course_id);
  if (!selectedCourse) {
    return { error: 'دوره انتخاب شده یافت نشد' };
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert([
      {
        ...exerciseData,
        course_id: selectedCourse.id,
        created_by: userId,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    return { error: error.message };
  }

  console.log('Exercise created successfully:', data);
  return { data, error: null };
};

export const deleteExercise = async (id: string): Promise<{ error: string | null }> => {
  console.log('Deleting exercise:', id);

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exercise:', error);
    return { error: error.message };
  }

  console.log('Exercise deleted successfully');
  return { error: null };
};
