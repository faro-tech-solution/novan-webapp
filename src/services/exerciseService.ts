
import { supabase } from '@/integrations/supabase/client';
import { Exercise, Course } from '@/types/exercise';
import { calculateExerciseStatus } from '@/utils/exerciseUtils';
import { ExerciseForm } from '@/types/formBuilder';

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

      // Parse form_structure from JSON if it exists
      let form_structure: ExerciseForm = { questions: [] };
      if (exercise.form_structure) {
        try {
          form_structure = typeof exercise.form_structure === 'string' 
            ? JSON.parse(exercise.form_structure) 
            : exercise.form_structure as ExerciseForm;
        } catch (error) {
          console.error('Error parsing form_structure:', error);
          form_structure = { questions: [] };
        }
      }

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

export const createExercise = async (
  exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'submissions' | 'total_students' | 'exercise_status' | 'course_name'>,
  userId: string,
  courses: Course[]
): Promise<{ data?: Exercise; error: string | null }> => {
  console.log('Creating exercise:', exerciseData);

  // Find the course by name to get the course_id
  const selectedCourse = courses.find(course => course.name === exerciseData.course_id);
  if (!selectedCourse) {
    return { error: 'دوره انتخاب شده یافت نشد' };
  }

  // Prepare data for insertion, converting form_structure to JSON
  const insertData = {
    ...exerciseData,
    course_id: selectedCourse.id,
    created_by: userId,
    form_structure: exerciseData.form_structure ? JSON.stringify(exerciseData.form_structure) : null,
  };

  const { data, error } = await supabase
    .from('exercises')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    return { error: error.message };
  }

  console.log('Exercise created successfully:', data);
  
  // Parse form_structure back for return
  let form_structure: ExerciseForm = { questions: [] };
  if (data.form_structure) {
    try {
      form_structure = typeof data.form_structure === 'string' 
        ? JSON.parse(data.form_structure) 
        : data.form_structure as ExerciseForm;
    } catch (error) {
      console.error('Error parsing form_structure:', error);
    }
  }

  const exerciseWithParsedForm: Exercise = {
    ...data,
    form_structure: form_structure,
    course_name: selectedCourse.name,
    submissions: 0,
    total_students: 0,
    exercise_status: calculateExerciseStatus(data),
  };

  return { data: exerciseWithParsedForm, error: null };
};

export const updateExercise = async (
  exerciseId: string,
  exerciseData: Partial<Exercise>,
  courses: Course[]
): Promise<{ data?: Exercise; error: string | null }> => {
  console.log('Updating exercise:', exerciseId, exerciseData);

  // If course_id is provided as a course name, convert it to course ID
  let updateData: any = { ...exerciseData };
  if (exerciseData.course_id && courses.length > 0) {
    const selectedCourse = courses.find(course => course.name === exerciseData.course_id);
    if (selectedCourse) {
      updateData.course_id = selectedCourse.id;
    }
  }

  // Convert form_structure to JSON string if it exists
  if (updateData.form_structure) {
    updateData.form_structure = JSON.stringify(updateData.form_structure);
  }

  const { data, error } = await supabase
    .from('exercises')
    .update(updateData)
    .eq('id', exerciseId)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    return { error: error.message };
  }

  console.log('Exercise updated successfully:', data);
  
  // Parse form_structure back for return
  let form_structure: ExerciseForm = { questions: [] };
  if (data.form_structure) {
    try {
      form_structure = typeof data.form_structure === 'string' 
        ? JSON.parse(data.form_structure) 
        : data.form_structure as ExerciseForm;
    } catch (error) {
      console.error('Error parsing form_structure:', error);
    }
  }

  const exerciseWithParsedForm: Exercise = {
    ...data,
    form_structure: form_structure,
    course_name: exerciseData.course_name || 'نامشخص',
    submissions: 0,
    total_students: 0,
    exercise_status: calculateExerciseStatus(data),
  };

  return { data: exerciseWithParsedForm, error: null };
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
