/**
 * Utility functions for Arvan Video exercises
 */

export interface ArvanVideoExerciseData {
  arvan_video_id: string;
}

/**
 * Validates Arvan Video exercise metadata
 */
export const validateArvanVideoMetadata = (metadata: any): ArvanVideoExerciseData | null => {
  try {
    if (!metadata) {
      console.log('No metadata provided for Arvan Video validation');
      return null;
    }

    // Parse metadata if it's a string
    let parsedMetadata = metadata;
    if (typeof metadata === 'string') {
      parsedMetadata = JSON.parse(metadata);
    }

    if (!parsedMetadata.arvan_video_id) {
      console.log('No arvan_video_id found in metadata');
      return null;
    }

    return {
      arvan_video_id: parsedMetadata.arvan_video_id,
    };
  } catch (error) {
    console.error('Error validating Arvan Video metadata:', error);
    return null;
  }
};

/**
 * Checks if an exercise has valid Arvan Video metadata
 */
export const hasValidArvanVideoMetadata = (exercise: any): boolean => {
  if (exercise.exercise_type !== 'arvan_video') {
    return false;
  }

  const arvanVideoData = validateArvanVideoMetadata(exercise.metadata);
  return arvanVideoData !== null;
};

/**
 * Extracts Arvan Video data from exercise metadata
 */
export const extractArvanVideoData = (exercise: any): ArvanVideoExerciseData | null => {
  if (exercise.exercise_type !== 'arvan_video') {
    return null;
  }

  return validateArvanVideoMetadata(exercise.metadata);
};

/**
 * Creates an Arvan Video exercise with proper metadata
 */
export const createArvanVideoExercise = async (
  exerciseData: any,
  arvanVideoId: string
): Promise<any> => {
  const metadata = {
    arvan_video_id: arvanVideoId,
  };

  return {
    ...exerciseData,
    exercise_type: 'arvan_video',
    metadata: JSON.stringify(metadata),
  };
};

/**
 * Updates an Arvan Video exercise's metadata
 */
export const updateArvanVideoExerciseMetadata = async (
  exerciseId: string,
  arvanVideoData: ArvanVideoExerciseData
): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const metadata = {
      arvan_video_id: arvanVideoData.arvan_video_id,
    };

    const { error } = await supabase
      .from('exercises')
      .update({
        metadata: JSON.stringify(metadata),
        updated_at: new Date().toISOString(),
      })
      .eq('id', exerciseId);

    if (error) {
      throw new Error(`Failed to update Arvan Video exercise metadata: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating Arvan Video exercise metadata:', error);
    throw error;
  }
};

export default {
  validateArvanVideoMetadata,
  hasValidArvanVideoMetadata,
  extractArvanVideoData,
  createArvanVideoExercise,
  updateArvanVideoExerciseMetadata,
};