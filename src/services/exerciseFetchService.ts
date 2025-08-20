import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
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

export const fetchExerciseById = async (exerciseId: string): Promise<Exercise> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      throw new Error(`Error fetching exercise: ${error.message}`);
    }

    if (!data) {
      throw new Error('Exercise not found');
    }

    

    // Parse metadata to extract Arvan Video and Negavid Video fields
    let arvan_video_id = "";
    let negavid_video_id = "";
    let attachments: string[] = [];
    if (data.metadata) {
      const metadata = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      arvan_video_id = metadata?.arvan_video_id || "";
      negavid_video_id = metadata?.negavid_video_id || "";
      attachments = metadata?.attachments || [];
    }

    return {
      ...data,
      course_name: data.courses.name,
      form_structure: parseFormStructure(data.form_structure),
      attachments: attachments,
      arvan_video_id,
      negavid_video_id
    } as any as Exercise;
  } catch (error) {
    console.error('Error in fetchExerciseById:', error);
    throw error;
  }
};

export const fetchExercises = async (courseId?: string): Promise<Exercise[]> => {
  try {
    let query = supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    // Sort exercises within each category
    const exercises = (data || []).map(exercise => {
      

      // Parse metadata to extract Arvan Video fields
      let arvan_video_id = "";
      let attachments: string[] = [];
      if (exercise.metadata) {
        const metadata = typeof exercise.metadata === 'string' 
          ? JSON.parse(exercise.metadata) 
          : exercise.metadata;
        arvan_video_id = metadata?.arvan_video_id || "";
        attachments = metadata?.attachments || [];
      }

      return {
        ...exercise,
        course_name: exercise.courses.name,
        form_structure: parseFormStructure(exercise.form_structure),
        attachments: attachments,
        arvan_video_id
      };
    }) as any[];

    // Since we're now using order_index which already includes proper ordering,
    // we can simply return the exercises as they are (already sorted by order_index)
    return exercises;
  } catch (error) {
    console.error('Error in fetchExercises:', error);
    throw error;
  }
};
