import { ExerciseSubmission as ExerciseSubmissionLegacy } from '@/types/exerciseSubmission';
// Using the legacy type for now to maintain compatibility

export const calculateSubmissionStatus = (
  submission: ExerciseSubmissionLegacy | undefined,
  adjustedOpenDate: Date,
  adjustedCloseDate: Date
): 'not_started' | 'pending' | 'completed' => {
  const today = new Date();
  
  console.log('Calculating submission status:', {
    hasSubmission: !!submission,
    submissionScore: submission?.score,
    adjustedOpenDate,
    adjustedCloseDate,
    today,
    isOpen: today >= adjustedOpenDate,
    isClosed: today > adjustedCloseDate
  });

  if (submission) {
    if (submission.score !== null && submission.score !== undefined) {
      return 'completed';
    } else {
      return 'pending';
    }
  } else {
    if (today >= adjustedOpenDate && today <= adjustedCloseDate) {
      return 'not_started';
    } else {
      // Exercise hasn't opened yet
      return 'not_started';
    }
  }
};
