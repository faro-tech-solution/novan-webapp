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

    

    // Parse metadata to extract Arvan Video fields
    let arvan_video_id = "";
    let attachments: string[] = [];
    if (data.metadata) {
      const metadata = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      arvan_video_id = metadata?.arvan_video_id || "";
      attachments = metadata?.attachments || [];
    }

    return {
      ...data,
      course_name: data.courses.name,
      form_structure: parseFormStructure(data.form_structure),
      attachments: attachments,
      arvan_video_id
    } as any as Exercise;
  } catch (error) {
    console.error('Error in fetchExerciseById:', error);
    throw error;
  }
};

export const fetchExercises = async (courseId?: string): Promise<Exercise[]> => {
  try {
    let query = supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .order('category_id', { ascending: true, nullsFirst: true })
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    // Sort exercises within each category
    const exercises = (data || []).map(exercise => {
      

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

      return {
        ...exercise,
        course_name: exercise.courses.name,
        form_structure: parseFormStructure(exercise.form_structure),
        attachments: attachments,
        arvan_video_id
      };
    }) as any[];

    // Group exercises by category and sort within each category
    const exercisesByCategory: Record<string, any[]> = {};
    const uncategorizedExercises: any[] = [];

    exercises.forEach(exercise => {
      const categoryId = exercise.category_id;
      if (categoryId) {
        if (!exercisesByCategory[categoryId]) {
          exercisesByCategory[categoryId] = [];
        }
        exercisesByCategory[categoryId].push(exercise);
      } else {
        uncategorizedExercises.push(exercise);
      }
    });

    // Sort exercises within each category by sort order, then by created_at
    Object.keys(exercisesByCategory).forEach(categoryId => {
      exercisesByCategory[categoryId].sort((a, b) => {
        if (a.sort !== b.sort) {
          return a.sort - b.sort;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });

    // Sort uncategorized exercises
    uncategorizedExercises.sort((a, b) => {
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Combine all exercises back together
    const sortedExercises = [
      ...uncategorizedExercises,
      ...Object.values(exercisesByCategory).flat()
    ];

    return sortedExercises;
  } catch (error) {
    console.error('Error in fetchExercises:', error);
    throw error;
  }
};
