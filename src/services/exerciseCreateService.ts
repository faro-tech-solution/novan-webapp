import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';

export interface CreateExerciseData {
  title: string;
  description?: string | null;
  difficulty: string;
  estimatedTime: string;
  points: number;
  courseId: string;

  exercise_type: 'form' | 'video' | 'audio' | 'simple' | 'spotplayer' | 'iframe' | 'arvan_video';
  content_url?: string | null;
  iframe_html?: string | null;
  auto_grade: boolean;
  formStructure: ExerciseForm | any;
  spotplayer_course_id?: string;
  spotplayer_item_id?: string;
  arvan_video_id?: string;
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
    const metadata: any = {};
    
    // Add SpotPlayer metadata if it's a SpotPlayer exercise
    if (exerciseData.exercise_type === 'spotplayer') {
      if (exerciseData.spotplayer_course_id) {
        metadata.spotplayer_course_id = exerciseData.spotplayer_course_id;
      }
      if (exerciseData.spotplayer_item_id) {
        metadata.spotplayer_item_id = exerciseData.spotplayer_item_id;
      }
    }

    // Add Arvan Video metadata if it's an Arvan Video exercise
    if (exerciseData.exercise_type === 'arvan_video') {
      if (exerciseData.arvan_video_id) {
        metadata.arvan_video_id = exerciseData.arvan_video_id;
      }
    }

    const requestData = {
      title: exerciseData.title,
      description: exerciseData.description || null,
      difficulty: exerciseData.difficulty,
      estimated_time: exerciseData.estimatedTime || '-',
      points: exerciseData.points,
      course_id: exerciseData.courseId,

      exercise_type: exerciseData.exercise_type,
      content_url: exerciseData.content_url,
      iframe_html: exerciseData.iframe_html,
      auto_grade: exerciseData.auto_grade,
      form_structure: JSON.stringify(exerciseData.formStructure || { questions: [] }),
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
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
