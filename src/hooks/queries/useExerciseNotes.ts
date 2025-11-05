import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchNotes,
  fetchAllNotes,
  createNote,
  updateNote,
  deleteNote,
} from '@/services/exerciseNotesService';
import { CreateNoteData, UpdateNoteData } from '@/types/exerciseNotes';

export const useExerciseNotes = (exerciseId: string, enabled = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exerciseNotes', exerciseId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const notes = await fetchNotes(exerciseId, user.id);
      const { count } = await supabase
        .from('exercise_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      return {
        notes,
        totalNotes: count || 0
      };
    },
    enabled: enabled && !!exerciseId && !!user,
  });
};

export const useAllCourseNotes = (courseId: string, enabled = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['allCourseNotes', courseId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const notes = await fetchAllNotes(courseId, user.id);
      const { count } = await supabase
        .from('exercise_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      return {
        notes,
        totalNotes: count || 0
      };
    },
    enabled: enabled && !!courseId && !!user,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateNoteData) => {
      if (!user) throw new Error('User not authenticated');
      return createNote(data, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['exerciseNotes', variables.exercise_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['allCourseNotes', variables.course_id],
      });
      toast({
        title: 'یادداشت ثبت شد',
        description: 'یادداشت شما با موفقیت ثبت شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'خطا در ثبت یادداشت',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: UpdateNoteData }) => {
      return updateNote(noteId, data);
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: ['exerciseNotes', note.exercise_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['allCourseNotes', note.course_id],
      });
      toast({
        title: 'به‌روزرسانی شد',
        description: 'یادداشت با موفقیت به‌روزرسانی شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'خطا در به‌روزرسانی',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (noteId: string) => {
      return deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['exerciseNotes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['allCourseNotes'],
      });
      toast({
        title: 'حذف شد',
        description: 'یادداشت با موفقیت حذف شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'خطا در حذف',
        variant: 'destructive',
      });
    },
  });
};