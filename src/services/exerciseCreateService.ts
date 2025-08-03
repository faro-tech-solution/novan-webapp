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

  exercise_type: 'form' | 'video' | 'audio' | 'simple';
  content_url?: string | null;
  auto_grade: boolean;
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

      exercise_type: exerciseData.exercise_type,
      content_url: exerciseData.content_url,
      auto_grade: exerciseData.auto_grade,
      form_structure: JSON.stringify(exerciseData.formStructure || { questions: [] }),
      created_by: createdBy,
    };

    console.log('Sending request to database:', requestData);

    const { data, error } = await supabase
      .from('exercises')
      .insert(requestData as any)
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
    } as unknown as Exercise;
  } catch (error) {
    console.error('Error in createExercise:', error);
    throw error;
  }
};
