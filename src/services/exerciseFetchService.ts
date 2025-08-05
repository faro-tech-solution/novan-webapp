import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';
import { extractSpotPlayerData } from '@/utils/spotplayerExerciseUtils';

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

    // Parse metadata to extract SpotPlayer fields
    let spotplayer_course_id = "";
    let spotplayer_item_id = "";
    
    const spotplayerData = extractSpotPlayerData(data as any);
    if (spotplayerData) {
      spotplayer_course_id = spotplayerData.spotplayer_course_id;
      spotplayer_item_id = spotplayerData.spotplayer_item_id || "";
    }

    return {
      ...data,
      course_name: data.courses.name,
      form_structure: parseFormStructure(data.form_structure),
      spotplayer_course_id,
      spotplayer_item_id
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
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    return (data || []).map(exercise => {
      // Parse metadata to extract SpotPlayer fields
      let spotplayer_course_id = "";
      let spotplayer_item_id = "";
      
      const spotplayerData = extractSpotPlayerData(exercise as any);
      if (spotplayerData) {
        spotplayer_course_id = spotplayerData.spotplayer_course_id;
        spotplayer_item_id = spotplayerData.spotplayer_item_id || "";
      }

      return {
        ...exercise,
        course_name: exercise.courses.name,
        form_structure: parseFormStructure(exercise.form_structure),
        spotplayer_course_id,
        spotplayer_item_id
      };
    }) as any[];
    // })) as Exercise[];
  } catch (error) {
    console.error('Error in fetchExercises:', error);
    throw error;
  }
};
