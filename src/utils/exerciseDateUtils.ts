
import { CourseEnrollment, ExerciseData } from '@/types/exerciseSubmission';

export const calculateAdjustedDates = (
  exercise: ExerciseData,
  enrollment: CourseEnrollment | undefined
) => {
  // Calculate the reference start date based on term or enrollment date
  let referenceStartDate: Date;
  
  if (enrollment?.course_terms?.start_date) {
    // If student is assigned to a term with start date, use term start date
    referenceStartDate = new Date(enrollment.course_terms.start_date);
    console.log(`Using term start date for course ${exercise.course_id}:`, referenceStartDate);
  } else {
    // If no term start date, use enrollment date
    referenceStartDate = new Date(enrollment?.enrolled_at || new Date());
    console.log(`Using enrollment date for course ${exercise.course_id}:`, referenceStartDate);
  }

  // Calculate new dates based on reference start date and relative days
  const adjustedOpenDate = new Date(referenceStartDate);
  adjustedOpenDate.setDate(adjustedOpenDate.getDate() + Math.max(0, exercise.days_to_open));
  
  // Fix: Due date should be calculated as referenceStartDate + days_to_open + days_to_due
  const adjustedDueDate = new Date(referenceStartDate);
  adjustedDueDate.setDate(adjustedDueDate.getDate() + Math.max(0, exercise.days_to_open + exercise.days_to_due));
  
  const adjustedCloseDate = new Date(referenceStartDate);
  adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, exercise.days_to_close));

  return {
    adjustedOpenDate,
    adjustedDueDate,
    adjustedCloseDate
  };
};
