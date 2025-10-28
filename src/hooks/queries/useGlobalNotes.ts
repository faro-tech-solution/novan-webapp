import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllUserNotes,
  createGlobalNote,
  updateNote,
  deleteNote,
} from '@/services/notesService';
import { CreateNoteData, UpdateNoteData } from '@/types/exerciseNotes';

export const useAllUserNotes = (enabled = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['allUserNotes', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const notes = await fetchAllUserNotes(user.id);
      return {
        notes,
        totalNotes: notes.length
      };
    },
    enabled: enabled && !!user,
  });
};

export const useCreateGlobalNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateNoteData) => {
      if (!user) throw new Error('User not authenticated');
      return createGlobalNote(data, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['allUserNotes'],
      });
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

export const useUpdateGlobalNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: UpdateNoteData }) => {
      return updateNote(noteId, data);
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: ['allUserNotes'],
      });
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

export const useDeleteGlobalNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (noteId: string) => {
      return deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['allUserNotes'],
      });
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