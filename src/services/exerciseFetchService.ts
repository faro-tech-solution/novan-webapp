
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { calculateExerciseStatus } from '@/utils/exerciseUtils';
import { ExerciseForm } from '@/types/formBuilder';

const parseFormStructure = (form_structure: any): ExerciseForm => {
  if (!form_structure) {
    return { questions: [] };
  }

  try {
    if (typeof form_structure === 'string') {
      return JSON.parse(form_structure) as ExerciseForm;
    } else if (typeof form_structure === 'object' && form_structure.questions) {
      return form_structure as ExerciseForm;
    }
    return { questions: [] };
  } catch (error) {
    console.error('Error parsing form_structure:', error);
    return { questions: [] };
  }
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
        .select('student_id')
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

      console.log(`Exercise ${exercise.title}: ${submissionCount} submissions, ${totalStudents} total students`);

      const form_structure = parseFormStructure(exercise.form_structure);

      const exerciseWithStats: Exercise = {
        ...exercise,
        course_name: exercise.courses?.name || 'نامشخص',
        submissions: submissionCount,
        total_students: totalStudents,
        exercise_status: calculateExerciseStatus(exercise),
        form_structure: form_structure,
      };

      return exerciseWithStats;
    })
  );

  return exercisesWithStats;
};
