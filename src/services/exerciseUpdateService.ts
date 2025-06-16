
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
  
  const form_structure = parseFormStructure(data.form_structure);

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
