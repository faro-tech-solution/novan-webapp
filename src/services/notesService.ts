import { supabase } from '@/integrations/supabase/client';
import { ExerciseNote, CreateNoteData } from '@/types/exerciseNotes';

export const fetchAllUserNotes = async (userId: string): Promise<ExerciseNote[]> => {
  const { data, error } = await supabase
    .from('exercise_notes')
    .select(`
      *,
      exercises:exercise_id (
        id,
        title,
        order_index
      ),
      courses:course_id (
        id,
        title
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all user notes:', error);
    throw new Error('Failed to fetch notes');
  }

  return data.map((item: any) => ({
    ...item,
    exercises: item.exercises ? {
      id: item.exercises.id,
      title: item.exercises.title,
      order_index: item.exercises.order_index
    } : undefined,
    courses: item.courses ? {
      id: item.courses.id,
      title: item.courses.title
    } : undefined
  }));
};

export const createGlobalNote = async (data: CreateNoteData, userId: string): Promise<ExerciseNote> => {
  const { data: note, error } = await supabase
    .from('exercise_notes')
    .insert({
      ...data,
      exercise_id: data.exercise_id ?? null,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw new Error('Failed to create note');
  }

  return note as any;
};

// Re-export existing functions for backward compatibility
export {
  fetchNotes,
  fetchAllNotes,
  createNote,
  updateNote,
  deleteNote,
} from './exerciseNotesService';