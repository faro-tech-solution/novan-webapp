import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';
import { CreateExerciseData } from './exerciseCreateService';

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

export const updateExercise = async (exerciseId: string, exerciseData: CreateExerciseData): Promise<Exercise> => {
  try {
    const metadata: any = {};
    


    // Add Arvan Video metadata if it's an Arvan Video exercise
    if (exerciseData.exercise_type === 'arvan_video') {
      if (exerciseData.arvan_video_id) {
        metadata.arvan_video_id = exerciseData.arvan_video_id;
      }
    }

    const { data, error } = await supabase
      .from('exercises')
      .update({
        title: exerciseData.title,
        description: exerciseData.description || null,
        difficulty: exerciseData.difficulty,
        estimated_time: exerciseData.estimatedTime,
        points: exerciseData.points,
        course_id: exerciseData.courseId,
        category_id: exerciseData.category_id || null,

        exercise_type: exerciseData.exercise_type,
        content_url: exerciseData.content_url,
        iframe_html: exerciseData.iframe_html,
        auto_grade: exerciseData.auto_grade,
        form_structure: JSON.stringify(exerciseData.formStructure),
        metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating exercise:', error);
      throw new Error(`Error updating exercise: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from exercise update');
    }

    return {
      ...data,
      form_structure: parseFormStructure(data.form_structure)
    } as unknown as Exercise;
  } catch (error) {
    console.error('Error in updateExercise:', error);
    throw error;
  }
};
