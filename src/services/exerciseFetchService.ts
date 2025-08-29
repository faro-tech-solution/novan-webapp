import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';


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

export const fetchExerciseById = async (exerciseId: string): Promise<Exercise> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      throw new Error(`Error fetching exercise: ${error.message}`);
    }

    if (!data) {
      throw new Error('Exercise not found');
    }

    

    // Parse metadata to extract Arvan Video and Negavid Video fields
    let arvan_video_id = "";
    let negavid_video_id = "";
    let attachments: string[] = [];
    if (data.metadata) {
      const metadata = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      arvan_video_id = metadata?.arvan_video_id || "";
      negavid_video_id = metadata?.negavid_video_id || "";
      attachments = metadata?.attachments || [];
    }

    return {
      ...data,
      course_name: data.courses.name,
      form_structure: parseFormStructure(data.form_structure),
      attachments: attachments,
      arvan_video_id,
      negavid_video_id
    } as any as Exercise;
  } catch (error) {
    console.error('Error in fetchExerciseById:', error);
    throw error;
  }
};

export const fetchExercises = async (courseId?: string, userId?: string): Promise<Exercise[]> => {
  try {
    // Build the select query based on whether we need submission data
    const selectQuery = userId 
      ? `*,
        courses!inner (
          name
        ),
        exercise_categories (
          id,
          name,
          description
        ),
        exercise_submissions!left (
          id,
          score,
          submitted_at,
          feedback,
          graded_at,
          graded_by,
          solution,
          student_id
        )`
      : `*,
        courses!inner (
          name
        ),
        exercise_categories (
          id,
          name,
          description
        )`;

    let query = supabase
      .from('exercises')
      .select(selectQuery)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (userId) {
      query = query.eq('exercise_submissions.student_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    // Sort exercises within each category
    const exercises = (data || []).map((exercise: any) => {
      // Parse metadata to extract Arvan Video fields
      let arvan_video_id = "";
      let attachments: string[] = [];
      if (exercise.metadata) {
        const metadata = typeof exercise.metadata === 'string' 
          ? JSON.parse(exercise.metadata) 
          : exercise.metadata;
        arvan_video_id = metadata?.arvan_video_id || "";
        attachments = metadata?.attachments || [];
      }

      // Determine submission status if userId was provided
      let submission_status: 'not_started' | 'pending' | 'completed' = 'not_started';
      let score: number | null = null;
      if (userId && exercise.exercise_submissions && exercise.exercise_submissions.length > 0) {
        const submission = exercise.exercise_submissions[0];
        submission_status = submission.score !== null ? 'completed' : 'pending';
        score = submission.score;
      }

      return {
        ...exercise,
        course_name: exercise.courses?.name,
        category_name: exercise.exercise_categories?.name,
        form_structure: parseFormStructure(exercise.form_structure),
        attachments: attachments,
        arvan_video_id,
        submission_status,
        score
      };
    }) as any[];

    // Since we're now using order_index which already includes proper ordering,
    // we can simply return the exercises as they are (already sorted by order_index)
    return exercises;
  } catch (error) {
    console.error('Error in fetchExercises:', error);
    throw error;
  }
};

/**
 * Get the next exercise in sequence based on order_index
 * @param currentExerciseId The ID of the current exercise
 * @param courseId The course ID to limit the search
 * @returns The next exercise or null if no next exercise exists
 */
export const getNextExercise = async (currentExerciseId: string, courseId: string): Promise<Exercise | null> => {
  try {
    // First, get the current exercise to find its order_index
    const { data: currentExercise, error: currentError } = await supabase
      .from('exercises')
      .select('order_index')
      .eq('id', currentExerciseId)
      .single();

    if (currentError || !currentExercise) {
      console.error('Error fetching current exercise:', currentError);
      return null;
    }

    // Get the next exercise with order_index greater than current
    const { data: nextExercise, error: nextError } = await supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .eq('course_id', courseId)
      .gt('order_index', (currentExercise as any).order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (nextError) {
      // No next exercise found
      if (nextError.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching next exercise:', nextError);
      return null;
    }

    if (!nextExercise) {
      return null;
    }

    // Parse metadata to extract Arvan Video and Negavid Video fields
    let arvan_video_id = "";
    let negavid_video_id = "";
    let attachments: string[] = [];
    if (nextExercise.metadata) {
      const metadata = typeof nextExercise.metadata === 'string' 
        ? JSON.parse(nextExercise.metadata) 
        : nextExercise.metadata;
      arvan_video_id = metadata?.arvan_video_id || "";
      negavid_video_id = metadata?.negavid_video_id || "";
      attachments = metadata?.attachments || [];
    }

    return {
      ...nextExercise,
      course_name: nextExercise.courses.name,
      form_structure: parseFormStructure(nextExercise.form_structure),
      attachments: attachments,
      arvan_video_id,
      negavid_video_id
    } as any as Exercise;
  } catch (error) {
    console.error('Error in getNextExercise:', error);
    return null;
  }
};
