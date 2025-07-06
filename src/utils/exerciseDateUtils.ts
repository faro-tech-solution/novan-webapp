import { CourseEnrollment } from '@/types/course';
import { ExerciseData } from '@/types/exerciseSubmission';

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
  adjustedOpenDate.setDate(adjustedOpenDate.getDate() + Math.max(0, exercise.days_to_open || 0));
  
  // Due date should be calculated as referenceStartDate + days_to_open + days_to_due
  const adjustedDueDate = new Date(referenceStartDate);
  adjustedDueDate.setDate(adjustedDueDate.getDate() + Math.max(0, (exercise.days_to_open || 0) + (exercise.days_to_due || 7)));
  
  // Close date should be calculated as referenceStartDate + days_to_close
  // If days_to_close is not set, default to due date + 7 days
  const adjustedCloseDate = new Date(referenceStartDate);
  if (exercise.days_to_close !== null && exercise.days_to_close !== undefined) {
    adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, exercise.days_to_close));
  } else {
    // Default to due date + 7 days if close date is not specified
    adjustedCloseDate.setDate(adjustedDueDate.getDate() + 7);
  }

  console.log(`Exercise ${exercise.id} dates:`, {
    referenceStartDate,
    adjustedOpenDate,
    adjustedDueDate,
    adjustedCloseDate,
    days_to_open: exercise.days_to_open,
    days_to_due: exercise.days_to_due,
    days_to_close: exercise.days_to_close
  });

  return {
    adjustedOpenDate,
    adjustedDueDate,
    adjustedCloseDate
  };
};
