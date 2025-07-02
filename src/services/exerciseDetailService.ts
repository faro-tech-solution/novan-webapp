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
        exercise_type,
        content_url,
        auto_grade,
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
      .select('solution, feedback, score, submitted_at, auto_graded, completion_percentage')
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
    if (submission?.solution) {
      try {
        submissionAnswers = JSON.parse(submission.solution);
      } catch (error) {
        console.error('Error parsing submission answers:', error);
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
      exercise_type: exercise.exercise_type || 'form',
      content_url: exercise.content_url,
      auto_grade: exercise.auto_grade || false,
      form_structure: form_structure,
      submission_answers: submissionAnswers,
      feedback: submission?.feedback,
      score: submission?.score,
      completion_percentage: submission?.completion_percentage || 0,
      auto_graded: submission?.auto_graded || false
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
  solution: string
): Promise<{ error: string | null }> => {
  console.log('Submitting solution for exercise:', exerciseId);

  // First get exercise details to check if it's auto-graded
  const { data: exercise } = await supabase
    .from('exercises')
    .select('auto_grade, exercise_type, points')
    .eq('id', exerciseId)
    .single();

  // Set default values for submission
  let submissionData: any = {
    exercise_id: exerciseId,
    student_id: studentId,
    solution: solution,
    submitted_at: new Date().toISOString()
  };

  // Handle auto-grading if enabled
  if (exercise && exercise.auto_grade) {
    const completion_percentage = 100; // For now, simple auto-grading gives 100%
    const score = exercise.points; // For auto-graded exercises, award full points
    
    submissionData = {
      ...submissionData,
      auto_graded: true,
      completion_percentage: completion_percentage,
      score: score,
      feedback: 'این تمرین به صورت خودکار نمره‌دهی شده است.',
      graded_at: new Date().toISOString()
    };
  }

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
