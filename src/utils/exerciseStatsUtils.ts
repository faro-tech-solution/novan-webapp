import { MyExerciseWithSubmission, Exercise, ExerciseType } from '@/types/exercise';
import { estimatedTimeToMinutes } from './estimatedTimeUtils';

export interface ExerciseStats {
  totalExercises: number;
  videoExercises: number;
  textExercises: number;
  totalVideoDuration: number; // in minutes
  completionPercentage: number;
}

export interface CategoryExerciseStats {
  totalExercises: number;
  videoExercises: number;
  textExercises: number;
  totalVideoDuration: number; // in minutes
  completionPercentage: number;
}

// Video exercise types
const VIDEO_EXERCISE_TYPES: ExerciseType[] = ['video', 'arvan_video', 'negavid', 'iframe'];

// Text exercise types
const TEXT_EXERCISE_TYPES: ExerciseType[] = ['form', 'simple'];

/**
 * Calculate overall exercise statistics
 */
export const calculateOverallExerciseStats = (
  exercises: (MyExerciseWithSubmission | Exercise)[]
): ExerciseStats => {
  const totalExercises = exercises.length;
  
  // Filter video and text exercises
  const videoExercises = exercises.filter(ex => 
    VIDEO_EXERCISE_TYPES.includes(ex.exercise_type)
  );
  
  const textExercises = exercises.filter(ex => 
    TEXT_EXERCISE_TYPES.includes(ex.exercise_type)
  );
  
  // Calculate total video duration in minutes (converting from seconds)
  const totalVideoDuration = videoExercises.reduce((total, ex) => {
    return total + estimatedTimeToMinutes(ex.estimated_time);
  }, 0);
  
  // Calculate completion percentage (only for exercises with submission status)
  const exercisesWithSubmission = exercises.filter(ex => 
    'submission_status' in ex
  ) as MyExerciseWithSubmission[];
  
  const completedExercises = exercisesWithSubmission.filter(ex => 
    ex.submission_status === 'completed'
  ).length;
  
  const completionPercentage = exercisesWithSubmission.length > 0 
    ? Math.round((completedExercises / exercisesWithSubmission.length) * 100)
    : 0;
  
  return {
    totalExercises,
    videoExercises: videoExercises.length,
    textExercises: textExercises.length,
    totalVideoDuration: Math.round(totalVideoDuration),
    completionPercentage
  };
};

/**
 * Calculate exercise statistics for a specific category
 */
export const calculateCategoryExerciseStats = (
  exercises: (MyExerciseWithSubmission | Exercise)[]
): CategoryExerciseStats => {
  const totalExercises = exercises.length;
  
  // Filter video and text exercises
  const videoExercises = exercises.filter(ex => 
    VIDEO_EXERCISE_TYPES.includes(ex.exercise_type)
  );
  
  const textExercises = exercises.filter(ex => 
    TEXT_EXERCISE_TYPES.includes(ex.exercise_type)
  );
  
  // Calculate total video duration in minutes (converting from seconds)
  const totalVideoDuration = videoExercises.reduce((total, ex) => {
    return total + estimatedTimeToMinutes(ex.estimated_time);
  }, 0);
  
  // Calculate completion percentage (only for exercises with submission status)
  const exercisesWithSubmission = exercises.filter(ex => 
    'submission_status' in ex
  ) as MyExerciseWithSubmission[];
  
  const completedExercises = exercisesWithSubmission.filter(ex => 
    ex.submission_status === 'completed'
  ).length;
  
  const completionPercentage = exercisesWithSubmission.length > 0 
    ? Math.round((completedExercises / exercisesWithSubmission.length) * 100)
    : 0;

  return {
    totalExercises,
    videoExercises: videoExercises.length,
    textExercises: textExercises.length,
    totalVideoDuration: Math.round(totalVideoDuration),
    completionPercentage
  };
};

/**
 * Format duration in minutes to a readable string
 */
export const formatDuration = (minutes: number, format?: 'time'): string => {
  if (format === 'time') {
    // Format as MM:SS or HH:MM:SS
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  // Default Persian format
  if (minutes < 60) {
    return `${minutes} دقیقه`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ساعت`;
  }
  
  return `${hours} ساعت و ${remainingMinutes} دقیقه`;
};
