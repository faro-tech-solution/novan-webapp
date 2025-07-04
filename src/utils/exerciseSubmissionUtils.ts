
import { ExerciseSubmission as ExerciseSubmissionLegacy } from '@/types/exerciseSubmission';
// Using the legacy type for now to maintain compatibility

export const calculateSubmissionStatus = (
  submission: ExerciseSubmissionLegacy | undefined,
  adjustedOpenDate: Date,
  adjustedCloseDate: Date
): 'not_started' | 'pending' | 'completed' | 'overdue' => {
  const today = new Date();

  if (submission) {
    if (submission.score !== null) {
      return 'completed';
    } else {
      return 'pending';
    }
  } else {
    if (today > adjustedCloseDate) {
      return 'overdue';
    } else if (today >= adjustedOpenDate && today <= adjustedCloseDate) {
      return 'not_started';
    }
  }
  
  return 'not_started';
};
