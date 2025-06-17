import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';

export interface CreateExerciseData {
  title: string;
  description?: string;
  difficulty: string;
  estimatedTime: string;
  points: number;
  courseId: string;
  daysToOpen: number;
  daysToDue: number;
  daysToClose: number;
  formStructure: ExerciseForm;
}

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

export const createExercise = async (exerciseData: CreateExerciseData, createdBy: string): Promise<Exercise> => {
  try {
    const requestData = {
      title: exerciseData.title,
      description: exerciseData.description || null,
      difficulty: exerciseData.difficulty,
      estimated_time: exerciseData.estimatedTime || '-',
      points: exerciseData.points,
      course_id: exerciseData.courseId,
      days_to_open: exerciseData.daysToOpen,
      days_to_due: exerciseData.daysToDue,
      days_to_close: exerciseData.daysToClose,
      form_structure: JSON.stringify(exerciseData.formStructure || { questions: [] }),
      created_by: createdBy,
    };

    console.log('Sending request to database:', requestData);

    const { data, error } = await supabase
      .from('exercises')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error('Error creating exercise:', error);
      throw new Error(`Error creating exercise: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from exercise creation');
    }

    return {
      ...data,
      form_structure: parseFormStructure(data.form_structure)
    } as Exercise;
  } catch (error) {
    console.error('Error in createExercise:', error);
    throw error;
  }
};
