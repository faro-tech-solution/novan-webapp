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
      .order('created_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    return (data || []).map(exercise => ({
      ...exercise,
      course_name: exercise.courses.name,
      form_structure: parseFormStructure(exercise.form_structure)
    })) as any[];
    // })) as Exercise[];
  } catch (error) {
    console.error('Error in fetchExercises:', error);
    throw error;
  }
};
