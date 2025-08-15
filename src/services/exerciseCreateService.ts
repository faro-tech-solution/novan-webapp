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

  exercise_type: 'form' | 'video' | 'audio' | 'simple' | 'iframe' | 'arvan_video';
  content_url?: string | null;
  iframe_html?: string | null;
  auto_grade: boolean;
  formStructure: ExerciseForm | any;

  arvan_video_id?: string;
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
    const metadata: any = {};
    


    // Add Arvan Video metadata if it's an Arvan Video exercise
    if (exerciseData.exercise_type === 'arvan_video') {
      if (exerciseData.arvan_video_id) {
        metadata.arvan_video_id = exerciseData.arvan_video_id;
      }
    }

    // Add attachments to metadata
    if (exerciseData.attachments && exerciseData.attachments.length > 0) {
      metadata.attachments = exerciseData.attachments;
    }

    // Get the next sort order for this course and category
    let query = supabase
      .from('exercises')
      .select('sort')
      .eq('course_id', exerciseData.courseId);
    
    // If category_id is provided, filter by category_id as well
    if (exerciseData.category_id) {
      query = query.eq('category_id', exerciseData.category_id);
    } else {
      // If no category_id, get exercises without category (uncategorized)
      query = query.is('category_id', null);
    }
    
    const { data: maxOrderData, error: maxOrderError } = await query
      .order('sort', { ascending: false })
      .limit(1);

    if (maxOrderError) {
      console.error('Error getting max sort order:', maxOrderError);
      throw new Error(`Error getting max sort order: ${maxOrderError.message}`);
    }

    const nextSortOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].sort + 1 : 0;

    const requestData = {
      title: exerciseData.title,
      description: exerciseData.description || null,
      difficulty: exerciseData.difficulty || null,
      estimated_time: exerciseData.estimatedTime || '-',
      points: exerciseData.points,
      course_id: exerciseData.courseId,
      category_id: exerciseData.category_id || null,
      sort: nextSortOrder,

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
