import { supabase } from '@/integrations/supabase/client';
import { checkAndAwardAchievements } from '@/services/awardsService';
import { FormAnswer, ExerciseForm } from '@/types/formBuilder';
import { 
  ExerciseDetail, 
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
        exercise_type,
        content_url,
        iframe_html,
        auto_grade,
        form_structure,
        metadata,
        order_index,
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



    // Get submission if exists
    const { data: submission, error: submissionError } = await supabase
      .from('exercise_submissions')
              .select('id, solution, feedback, score, submitted_at')
      .eq('exercise_id', exerciseId)
      .eq('student_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle cases where no submission exists

    // Log submission retrieval for debugging
    console.log('Submission fetch result:', submission ? 'found' : 'not found', 
                submissionError ? `Error: ${submissionError.message}` : 'No error');
    
    const typedSubmission = submission as unknown as ExerciseSubmission | null;

    // Determine submission status
    let submissionStatus: SubmissionStatusType = 'not_started';
    
    if (typedSubmission) {
      if (typedSubmission.score !== null) {
        submissionStatus = 'completed';
      } else {
        submissionStatus = 'pending';
      }
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

    // Parse metadata to extract attachments and other metadata
    let attachments: string[] = [];
    let arvan_video_id: string | undefined;
    let negavid_video_id: string | undefined;
    
    if (typedExercise.metadata) {
      try {
        const metadata = typeof typedExercise.metadata === 'string'
          ? JSON.parse(typedExercise.metadata)
          : typedExercise.metadata;
        
        attachments = metadata.attachments || [];
        arvan_video_id = metadata.arvan_video_id;
        negavid_video_id = metadata.negavid_video_id;
      } catch (error) {
        console.error('Error parsing exercise metadata:', error);
      }
    }

    return {
      id: typedExercise.id,
      title: typedExercise.title,
      description: typedExercise.description,
      course_id: typedExercise.course_id,
      course_name: typedExercise.courses?.name || 'دوره نامشخص',
      difficulty: typedExercise.difficulty,
      points: typedExercise.points,
      estimated_time: typedExercise.estimated_time,

      submission_status: submissionStatus,
      exercise_type: typedExercise.exercise_type,
      content_url: typedExercise.content_url,
      iframe_html: typedExercise.iframe_html,
      auto_grade: typedExercise.auto_grade,
      form_structure: form_structure,
      submission_answers: submissionAnswers,
      feedback: submissionFeedback || typedSubmission?.feedback || undefined,
      score: typedSubmission?.score || undefined,
      submission_id: typedSubmission?.id || undefined,
      metadata: typedExercise.metadata,
      attachments: attachments,
      arvan_video_id: arvan_video_id,
      negavid_video_id: negavid_video_id
    };
  } catch (error) {
    console.error('Error in fetchExerciseDetail:', error);
    throw error;
  }
};

export const submitExerciseSolution = async (
  exerciseId: string,
  studentId: string,
  solution: string,
  courseId: string,
  feedback?: string,
  autoGrade?: boolean,
  attachments?: string[]
): Promise<{ error: string | null; submissionId?: string }> => {
  console.log('Submitting solution for exercise:', exerciseId, 'autoGrade:', autoGrade);

  // Only store feedback in solution for auto_grade exercises
  // For non-auto_grade exercises, feedback will be stored in conversation
  let finalSolution = solution;
  
  if (feedback && feedback.trim() && autoGrade) {
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
    course_id: courseId, // Set course_id from parameter
    solution: finalSolution,
    latest_answer: 'trainee', // Set latest_answer to role instead of solution
    submission_status: 'pending', // Set default submission status
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
  
  const { data: submissionResult, error } = await supabase
    .from('exercise_submissions')
    .upsert(submissionData, {
      onConflict: 'exercise_id,student_id'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error submitting solution:', error);
    return { error: error.message };
  }

  const submissionId = submissionResult?.id;

  // For non-auto_grade exercises, create conversation entry if feedback exists
  if (!autoGrade && (feedback?.trim() || (attachments && attachments.length > 0)) && submissionId) {
    try {
      const metaData = {
        type: 'initial_submission',
        attachments: attachments || []
      };

      const { error: conversationError } = await supabase
        .from('exercise_submissions_conversation')
        .insert({
          submission_id: submissionId,
          sender_id: studentId,
          message: feedback?.trim() || '',
          meta_data: metaData,
          created_at: new Date().toISOString(),
        });

      if (conversationError) {
        console.error('Error creating conversation entry:', conversationError);
        // Don't fail the submission if conversation creation fails
      } else {
        console.log('Conversation entry created for non-auto_grade exercise');
      }
    } catch (conversationError) {
      console.error('Error creating conversation entry:', conversationError);
      // Don't fail the submission if conversation creation fails
    }
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
  return { error: null, submissionId };
};

/**
 * Fetch conversation messages for a given exercise submission.
 * @param submissionId The ID of the exercise submission
 * @returns Array of conversation messages sorted by created_at ascending
 */
export const fetchSubmissionConversation = async (submissionId: string): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('exercise_submissions_conversation')
      .select(`
        *,
        sender:profiles!sender_id (
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSubmissionConversation:', error);
    return [];
  }
};
