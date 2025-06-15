
import { Exercise } from '@/types/exercise';

export const calculateExerciseStatus = (exercise: Exercise): 'upcoming' | 'active' | 'overdue' | 'closed' => {
  const today = new Date();
  const openDate = new Date(exercise.open_date);
  const closeDate = new Date(exercise.close_date);
  
  if (today < openDate) {
    return 'upcoming';
  } else if (today >= openDate && today <= closeDate) {
    return 'active';
  } else {
    return 'overdue';
  }
};
