
import { supabase } from '@/integrations/supabase/client';
import { Exercise, Course } from '@/types/exercise';
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
  
  const form_structure = parseFormStructure(data.form_structure);

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
