import { supabase } from '@/integrations/supabase/client';
import { checkAndAwardAchievements } from '@/services/awardsService';
import { FormAnswer, ExerciseForm } from '@/types/formBuilder';
import { logStudentActivity, ACTIVITY_TYPES } from '@/services/activityLogService';
import { ExerciseDetail } from '@/types/exercise';

const parseFormStructure = (form_structure: any): ExerciseForm => {
  if (!form_structure) {
    return { questions: [] };
  }

  try {
    if (typeof form_structure === 'string') {
      return JSON.parse(form_structure) as ExerciseForm;
    } else if (typeof form_structure === 'object' && form_structure.questions) {
      return form_structure as ExerciseForm;
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
    // First get the exercise details
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
        days_to_open,
        days_to_due,
        created_at,
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

    // Calculate dates
    const createdDate = new Date(exercise.created_at);
    const openDate = new Date(createdDate);
    openDate.setDate(openDate.getDate() + exercise.days_to_open);
    
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + exercise.days_to_due);

    // Get submission if exists
    const { data: submission } = await supabase
      .from('exercise_submissions')
      .select('solution, feedback, score, submitted_at')
      .eq('exercise_id', exerciseId)
      .eq('student_id', userId)
      .single();

    // Determine submission status
    const now = new Date();
    let submissionStatus: 'not_started' | 'pending' | 'completed' | 'overdue' = 'not_started';
    
    if (submission) {
      if (submission.score !== null) {
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
    
    if (submission?.solution) {
      try {
        const parsedSolution = JSON.parse(submission.solution);
        
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

    const form_structure = parseFormStructure(exercise.form_structure);

    return {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      course_id: exercise.course_id,
      course_name: exercise.courses?.name || 'نامشخص',
      difficulty: exercise.difficulty,
      points: exercise.points,
      estimated_time: exercise.estimated_time,
      open_date: openDate.toISOString(),
      due_date: dueDate.toISOString(),
      submission_status: submissionStatus,
      exercise_type: 'form', // Default to form for now
      content_url: null, // Will be added when migration is run
      auto_grade: false, // Will be added when migration is run
      form_structure: form_structure,
      submission_answers: submissionAnswers,
      feedback: submissionFeedback || submission?.feedback,
      score: submission?.score,
      completion_percentage: 0, // Will be added when migration is run
      auto_graded: false // Will be added when migration is run
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
  let submissionData: any = {
    exercise_id: exerciseId,
    student_id: studentId,
    solution: finalSolution,
    submitted_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('exercise_submissions')
    .upsert(submissionData, {
      onConflict: 'exercise_id,student_id'
    });

  if (error) {
    console.error('Error submitting solution:', error);
    return { error: error.message };
  }

  // Trigger achievement checking after successful submission
  try {
    await checkAndAwardAchievements(studentId);
  } catch (achievementError) {
    console.error('Error checking achievements:', achievementError);
    // Don't fail the submission if achievement checking fails
  }

  console.log('Solution submitted successfully');
  return { error: null };
};
