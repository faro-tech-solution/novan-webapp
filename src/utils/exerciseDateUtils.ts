
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

  // Calculate the difference from exercise creation to open/close/due dates
  const exerciseCreatedDate = new Date(exercise.created_at);
  const originalOpenDate = new Date(exercise.open_date);
  const originalCloseDate = new Date(exercise.close_date);
  const originalDueDate = new Date(exercise.due_date);
  
  const daysToOpen = Math.ceil((originalOpenDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToDue = Math.ceil((originalDueDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToClose = Math.ceil((originalCloseDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate new dates based on reference start date
  const adjustedOpenDate = new Date(referenceStartDate);
  adjustedOpenDate.setDate(adjustedOpenDate.getDate() + Math.max(0, daysToOpen));
  
  const adjustedDueDate = new Date(referenceStartDate);
  adjustedDueDate.setDate(adjustedDueDate.getDate() + Math.max(0, daysToDue));
  
  const adjustedCloseDate = new Date(referenceStartDate);
  adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, daysToClose));

  return {
    adjustedOpenDate,
    adjustedDueDate,
    adjustedCloseDate
  };
};
