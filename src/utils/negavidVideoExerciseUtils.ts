

export interface NegavidVideoExerciseData {
  negavid_video_id: string;
}

/**
 * Validates Negavid Video metadata from exercise
 */
export const validateNegavidVideoMetadata = (metadata: any): NegavidVideoExerciseData | null => {
  console.log('validateNegavidVideoMetadata - Metadata:', metadata);
  try {
    if (!metadata || typeof metadata !== 'object') {
      return null;
    }

    // Parse metadata if it's a string
    const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    if (!parsedMetadata.negavid_video_id || typeof parsedMetadata.negavid_video_id !== 'string') {
      return null;
    }

    console.log('validateNegavidVideoMetadata - Parsed metadata:', parsedMetadata);

    return {
      negavid_video_id: parsedMetadata.negavid_video_id.trim(),
    };
  } catch (error) {
    console.error('Error validating Negavid Video metadata:', error);
    return null;
  }
};

/**
 * Checks if an exercise has valid Negavid Video metadata
 */
export const hasValidNegavidVideoMetadata = (exercise: any): boolean => {
  if (exercise.exercise_type !== 'negavid') {
    return false;
  }

  return validateNegavidVideoMetadata(JSON.parse(exercise.metadata)) !== null;
};

/**
 * Extracts Negavid Video data from exercise metadata
 */
export const extractNegavidVideoData = (exercise: any): NegavidVideoExerciseData | null => {
  if (exercise.exercise_type !== 'negavid') {
    return null;
  }

  return validateNegavidVideoMetadata(JSON.parse(exercise.metadata));
};

/**
 * Creates a Negavid Video exercise with proper metadata
 */
export const createNegavidVideoExercise = async (
  exerciseData: any,
  negavidVideoId: string
): Promise<any> => {
  const metadata = {
    negavid_video_id: negavidVideoId,
  };

  return {
    ...exerciseData,
    exercise_type: 'negavid',
    metadata: JSON.stringify(metadata),
  };
};

/**
 * Updates a Negavid Video exercise's metadata
 */
export const updateNegavidVideoExerciseMetadata = async (
  _exerciseId: string,
  _negavidVideoData: NegavidVideoExerciseData
): Promise<void> => {
  // This would typically update the database
  // For now, we'll just return a promise
  return Promise.resolve();
};

/**
 * Formats Negavid Video ID for display
 */
export const formatNegavidVideoId = (videoId: string): string => {
  if (!videoId) return '';
  
  // Remove any URL parts and extract just the ID
  const cleanId = videoId.replace(/^https?:\/\/[^\/]+\//, '').replace(/\?.*$/, '');
  
  // Truncate if too long
  if (cleanId.length > 20) {
    return cleanId.substring(0, 20) + '...';
  }
  
  return cleanId;
};

/**
 * Extracts Negavid Video ID from various input formats
 */
export const extractNegavidVideoId = (input: string): string | null => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  
  // If it looks like a UUID or simple ID, return as is
  if (/^[a-zA-Z0-9\-_]{8,}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try to extract from URL
  const urlMatch = trimmed.match(/\/videos\/([a-zA-Z0-9\-_]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Try to extract from embed code
  const embedMatch = trimmed.match(/video_id["\s]*[:=]["\s]*([a-zA-Z0-9\-_]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }
  
  return null;
};
