import { supabase } from '@/integrations/supabase/client';
import { ExerciseNote, CreateNoteData, UpdateNoteData } from '@/types/exerciseNotes';

export const fetchNotes = async (exerciseId: string, userId: string): Promise<ExerciseNote[]> => {
  const { data, error } = await supabase
    .from('exercise_notes')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw new Error('Failed to fetch notes');
  }

  return data || [];
};

export const fetchAllNotes = async (courseId: string, userId: string): Promise<ExerciseNote[]> => {
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
        name
      )
    `)
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all notes:', error);
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
      title: item.courses.name
    } : undefined
  }));
};

export const createNote = async (data: CreateNoteData, userId: string): Promise<ExerciseNote> => {
  const { data: note, error } = await supabase
    .from('exercise_notes')
    .insert({
      exercise_id: data.exercise_id || null, // Allow null for global notes
      course_id: data.course_id,
      title: data.title,
      content: data.content,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw new Error('Failed to create note');
  }

  return note;
};

export const updateNote = async (noteId: string, data: UpdateNoteData): Promise<ExerciseNote> => {
  const updateData: any = {
    content: data.content,
    updated_at: new Date().toISOString()
  };

  // Only update title if provided
  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  const { data: note, error } = await supabase
    .from('exercise_notes')
    .update(updateData)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }

  return note;
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('exercise_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
};
