
import { Exercise } from '@/types/exercise';

export const calculateExerciseStatus = (exercise: Exercise): 'upcoming' | 'active' | 'overdue' | 'closed' => {
  // For admin/trainer view, we can't calculate status without enrollment context
  // This function is now primarily used for student views where dates are calculated
  // Return 'active' as default for admin/trainer views
  return 'active';
};
