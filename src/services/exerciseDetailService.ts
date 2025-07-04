import { supabase } from '@/integrations/supabase/client';
import { checkAndAwardAchievements } from '@/services/awardsService';
import { FormAnswer, ExerciseForm } from '@/types/formBuilder';
import { logStudentActivity, ACTIVITY_TYPES } from '@/services/activityLogService';
import { 
  ExerciseDetail, 
  ExerciseType, 
  SubmissionStatusType,
  ExerciseWithCourse,
  ExerciseSubmission,
  SubmissionData
} from '@/types/exercise';
import { Json } from '@/integrations/supabase/types';

const parseFormStructure = (form_structure: Json | null): ExerciseForm => {
  if (!form_structure) {
    return { questions: [] };
  }

  try {
    if (typeof form_structure === 'string') {
      return JSON.parse(form_structure) as ExerciseForm;
    } else if (typeof form_structure === 'object' && form_structure !== null && 'questions' in form_structure) {
      return form_structure as unknown as ExerciseForm;
    }
    return { questions: [] };
  } catch (error) {
    console.error('Error parsing form_structure:', error);
    return { questions: [] };
  }
};

export const fetchExerciseDetail = async (exerciseId: string, userId: string): Promise<ExerciseDetail | null> => {
  console.log('Fetching exercise detail for:', exerciseId, 'user:', userId);

  try {
    // First get the exercise details with course relationship
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select(`
        id,
        title,
        description,
        course_id,
        difficulty,
        points,
        estimated_time,
        created_at,
        days_to_open,
        days_to_due,
        exercise_type,
        content_url,
        auto_grade,
        form_structure,
        courses (
          name
        )
      `)
      .eq('id', exerciseId)
      .single();

    if (exerciseError) {
      console.error('Error fetching exercise:', exerciseError);
      throw new Error('تمرین یافت نشد');
    }

    if (!exercise) {
      return null;
    }

    const typedExercise = exercise as unknown as ExerciseWithCourse;

    // Calculate dates dynamically based on created_at + days_to_open/days_to_due
    const createdDate = new Date(typedExercise.created_at);
    const daysToOpen = typedExercise.days_to_open || 0;
    const daysToDue = typedExercise.days_to_due || 7;
    
    const openDate = new Date(createdDate);
    openDate.setDate(openDate.getDate() + daysToOpen);
    
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + daysToDue);

    // Get submission if exists
    const { data: submission, error: submissionError } = await supabase
      .from('exercise_submissions')
      .select('solution, feedback, score, submitted_at, auto_graded, completion_percentage')
      .eq('exercise_id', exerciseId)
      .eq('student_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle cases where no submission exists

    // Log submission retrieval for debugging
    console.log('Submission fetch result:', submission ? 'found' : 'not found', 
                submissionError ? `Error: ${submissionError.message}` : 'No error');
    
    const typedSubmission = submission as unknown as ExerciseSubmission | null;

    // Determine submission status
    const now = new Date();
    let submissionStatus: SubmissionStatusType = 'not_started';
    
    if (typedSubmission) {
      if (typedSubmission.score !== null) {
        submissionStatus = 'completed';
      } else {
        submissionStatus = 'pending';
      }
    } else if (now > dueDate) {
      submissionStatus = 'overdue';
    }

    // Parse submission answers if they exist
    let submissionAnswers: FormAnswer[] = [];
    let submissionFeedback: string | undefined;
    
    if (typedSubmission?.solution) {
      try {
        const parsedSolution = JSON.parse(typedSubmission.solution);
        
        // Check if this is a new format with feedback
        if (parsedSolution.exerciseType === 'media' && parsedSolution.feedback) {
          submissionAnswers = Array.isArray(parsedSolution.answers) ? parsedSolution.answers : [];
          submissionFeedback = parsedSolution.feedback;
        } else if (Array.isArray(parsedSolution)) {
          // Old format - just form answers
          submissionAnswers = parsedSolution;
        } else {
          // Handle other formats
          submissionAnswers = [];
        }
      } catch (error) {
        console.error('Error parsing submission solution:', error);
      }
    }

    const form_structure = parseFormStructure(typedExercise.form_structure || null);

    return {
      id: typedExercise.id,
      title: typedExercise.title,
      description: typedExercise.description,
      course_id: typedExercise.course_id,
      course_name: typedExercise.courses?.name || 'دوره نامشخص',
      difficulty: typedExercise.difficulty,
      points: typedExercise.points,
      estimated_time: typedExercise.estimated_time,
      open_date: openDate.toISOString(),
      due_date: dueDate.toISOString(),
      submission_status: submissionStatus,
      exercise_type: typedExercise.exercise_type,
      content_url: typedExercise.content_url,
      auto_grade: typedExercise.auto_grade,
      form_structure: form_structure,
      submission_answers: submissionAnswers,
      feedback: submissionFeedback || typedSubmission?.feedback || undefined,
      score: typedSubmission?.score || undefined,
      completion_percentage: typedSubmission?.completion_percentage || 0,
      auto_graded: typedSubmission?.auto_graded || false
    };
  } catch (error) {
    console.error('Error in fetchExerciseDetail:', error);
    throw error;
  }
};

export const submitExerciseSolution = async (
  exerciseId: string,
  studentId: string,
  studentEmail: string,
  studentName: string,
  solution: string,
  feedback?: string
): Promise<{ error: string | null }> => {
  console.log('Submitting solution for exercise:', exerciseId);

  // For video, audio, and simple exercises, store feedback in the solution field
  // as a JSON object with both answers and feedback
  let finalSolution = solution;
  
  if (feedback && feedback.trim()) {
    try {
      // Try to parse existing solution to see if it's already JSON
      const existingSolution = JSON.parse(solution);
      // If it's an array (form answers), wrap it with feedback
      finalSolution = JSON.stringify({
        answers: existingSolution,
        feedback: feedback.trim(),
        exerciseType: 'media' // indicator that this includes feedback
      });
    } catch {
      // If solution is not JSON (simple string), create new structure
      finalSolution = JSON.stringify({
        answers: solution,
        feedback: feedback.trim(),
        exerciseType: 'media'
      });
    }
  }

  // Set default values for submission
  const submissionData: SubmissionData = {
    exercise_id: exerciseId,
    student_id: studentId,
    solution: finalSolution,
    submitted_at: new Date().toISOString()
  };

  console.log('Upserting submission with conflict on:', 'exercise_id,student_id');
  
  // Log the submission data for debugging
  console.log('Submission data:', {
    ...submissionData,
    solution: submissionData.solution.length > 100 
      ? submissionData.solution.substring(0, 100) + '...' 
      : submissionData.solution
  });
  
  const { error } = await supabase
    .from('exercise_submissions')
    .upsert(submissionData, {
      onConflict: 'exercise_id,student_id'
    });

  if (error) {
    console.error('Error submitting solution:', error);
    return { error: error.message };
  }

  console.log('Solution submitted successfully, checking achievements');
  
  // Trigger achievement checking after successful submission
  try {
    await checkAndAwardAchievements(studentId);
    console.log('Achievement check completed successfully');
  } catch (achievementError) {
    console.error('Error checking achievements:', achievementError);
    // Don't fail the submission if achievement checking fails
  }

  console.log('Solution submitted successfully');
  return { error: null };
};
