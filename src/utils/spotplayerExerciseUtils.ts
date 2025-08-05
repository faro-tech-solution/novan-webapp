import { supabase } from '@/integrations/supabase/client';

export interface SpotPlayerExerciseData {
  spotplayer_course_id: string;
  spotplayer_item_id?: string;
  spotplayer_license_key?: string;
  auto_create_license?: boolean;
}

export interface CreateSpotPlayerExerciseParams {
  title: string;
  description?: string;
  course_id: string;
  difficulty: string;
  points: number;
  estimated_time: string;
  created_by: string;
  spotplayerData: SpotPlayerExerciseData;
  auto_grade?: boolean;
}

/**
 * Creates a SpotPlayer exercise with proper metadata
 */
export const createSpotPlayerExercise = async (params: CreateSpotPlayerExerciseParams) => {
  try {
    const { spotplayerData, ...exerciseParams } = params;
    
    const exercise = {
      ...exerciseParams,
      exercise_type: 'spotplayer' as const,
      auto_grade: params.auto_grade || false,
      metadata: {
        spotplayer_course_id: spotplayerData.spotplayer_course_id,
        spotplayer_item_id: spotplayerData.spotplayer_item_id || null,
        spotplayer_license_key: spotplayerData.spotplayer_license_key || null,
        auto_create_license: spotplayerData.auto_create_license || false
      },
      days_to_close: 0,
      days_to_due: 0,
      days_to_open: 0
    };

    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create SpotPlayer exercise: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating SpotPlayer exercise:', error);
    throw error;
  }
};

/**
 * Updates a SpotPlayer exercise's metadata
 */
export const updateSpotPlayerExerciseMetadata = async (
  exerciseId: string, 
  spotplayerData: SpotPlayerExerciseData
) => {
  try {
    const metadata = {
      spotplayer_course_id: spotplayerData.spotplayer_course_id,
      spotplayer_item_id: spotplayerData.spotplayer_item_id || null,
      spotplayer_license_key: spotplayerData.spotplayer_license_key || null,
      auto_create_license: spotplayerData.auto_create_license || false
    };

    const { data, error } = await supabase
      .from('exercises')
      .update({ metadata })
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update SpotPlayer exercise metadata: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating SpotPlayer exercise metadata:', error);
    throw error;
  }
};

/**
 * Validates SpotPlayer exercise metadata
 */
export const validateSpotPlayerMetadata = (metadata: any): SpotPlayerExerciseData | null => {
  try {
    if (!metadata) {
      return null;
    }

    const parsedMetadata = typeof metadata === 'string' 
      ? JSON.parse(metadata) 
      : metadata;

    if (!parsedMetadata || typeof parsedMetadata !== 'object') {
      return null;
    }

    if (!parsedMetadata.spotplayer_course_id) {
      return null;
    }

    return {
      spotplayer_course_id: parsedMetadata.spotplayer_course_id,
      spotplayer_item_id: parsedMetadata.spotplayer_item_id || undefined,
      spotplayer_license_key: parsedMetadata.spotplayer_license_key || undefined,
      auto_create_license: parsedMetadata.auto_create_license || false
    };
  } catch (error) {
    console.error('Error validating SpotPlayer metadata:', error);
    return null;
  }
};

/**
 * Checks if an exercise has valid SpotPlayer metadata
 */
export const hasValidSpotPlayerMetadata = (exercise: any): boolean => {
  if (exercise.exercise_type !== 'spotplayer') {
    return false;
  }

  const spotplayerData = validateSpotPlayerMetadata(exercise.metadata);
  return spotplayerData !== null && !!spotplayerData.spotplayer_course_id;
};

/**
 * Extracts SpotPlayer data from exercise metadata
 */
export const extractSpotPlayerData = (exercise: any): SpotPlayerExerciseData | null => {
  if (exercise.exercise_type !== 'spotplayer') {
    return null;
  }

  return validateSpotPlayerMetadata(exercise.metadata);
}; 