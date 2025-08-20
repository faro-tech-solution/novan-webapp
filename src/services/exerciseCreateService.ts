import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';

export interface CreateExerciseData {
  title: string;
  description?: string | null;
  difficulty: string | null;
  estimatedTime: string;
  points: number;
  courseId: string;
  category_id?: string | null;

  exercise_type: 'form' | 'video' | 'audio' | 'simple' | 'iframe' | 'arvan_video' | 'negavid';
  content_url?: string | null;
  iframe_html?: string | null;
  auto_grade: boolean;
  formStructure: ExerciseForm | any;

  arvan_video_id?: string;
  negavid_video_id?: string;
  attachments?: string[]; // Array of uploaded file URLs
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
    console.log('createExercise called with data:', exerciseData);
    const metadata: any = {};
    


    // Add Arvan Video metadata if it's an Arvan Video exercise
    if (exerciseData.exercise_type === 'arvan_video') {
      if (exerciseData.arvan_video_id) {
        metadata.arvan_video_id = exerciseData.arvan_video_id;
      }
    }

    // Add Negavid Video metadata if it's a Negavid Video exercise
    if (exerciseData.exercise_type === 'negavid') {
      console.log('Processing negavid exercise, negavid_video_id:', exerciseData.negavid_video_id);
      if (exerciseData.negavid_video_id) {
        metadata.negavid_video_id = exerciseData.negavid_video_id;
        console.log('Added negavid_video_id to metadata:', metadata.negavid_video_id);
      }
    }

    // Add attachments to metadata
    if (exerciseData.attachments && exerciseData.attachments.length > 0) {
      metadata.attachments = exerciseData.attachments;
    }

    // order_index is automatically calculated by database triggers
    // No need to manually calculate sort order

    const requestData = {
      title: exerciseData.title,
      description: exerciseData.description || null,
      difficulty: exerciseData.difficulty || null,
      estimated_time: exerciseData.estimatedTime || '-',
      points: exerciseData.points,
      course_id: exerciseData.courseId,
      category_id: exerciseData.category_id || null,
      exercise_type: exerciseData.exercise_type,
      content_url: exerciseData.content_url,
      iframe_html: exerciseData.iframe_html,
      auto_grade: exerciseData.auto_grade,
      form_structure: JSON.stringify(exerciseData.formStructure || { questions: [] }),
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      created_by: createdBy,
    };

    console.log('Final metadata:', metadata);
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
