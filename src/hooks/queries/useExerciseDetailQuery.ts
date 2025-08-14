import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchExerciseDetail, submitExerciseSolution, fetchSubmissionConversation } from '@/services/exerciseDetailService';
import { useToast } from '@/hooks/use-toast';
import { FormAnswer } from '@/types/formBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ConversationMessage = {
  created_at: string;
  id: number;
  message: string;
  meta_data: any;
  sender_id: string;
  submission_id: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  }
};

export const useExerciseDetailQuery = (exerciseId: string, userId: string | undefined) => {
  return useQuery({
    queryKey: ['exercise', exerciseId, userId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return fetchExerciseDetail(exerciseId, userId);
    },
    enabled: !!userId,
  });
};

export const useSubmitExerciseMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      studentId,
      answers,
      courseId,
      feedback,
      autoGrade,
      attachments,
    }: {
      exerciseId: string;
      studentId: string;
      answers: FormAnswer[];
      courseId: string;
      feedback?: string;
      autoGrade?: boolean;
      attachments?: string[];
    }) => {
      const result = await submitExerciseSolution(
        exerciseId,
        studentId,
        JSON.stringify(answers),
        courseId,
        feedback,
        autoGrade,
        attachments
      );

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate exercise detail query to refetch with new submission
      queryClient.invalidateQueries({
        queryKey: ['exercise', variables.exerciseId, variables.studentId],
      });

      toast({
        title: "ارسال شد",
        description: "پاسخ شما با موفقیت ارسال شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در ارسال پاسخ",
        variant: "destructive",
      });
    },
  });
};

export const useSubmissionConversation = (submissionId: string | undefined) => {
  return useQuery<ConversationMessage[], Error>({
    queryKey: ['submissionConversation', submissionId],
    queryFn: async () => {
      if (!submissionId) throw new Error('No submissionId');
      return fetchSubmissionConversation(submissionId) as unknown as Promise<ConversationMessage[]>;
    },
    enabled: !!submissionId,
    refetchInterval: 5000, // Poll for new messages every 5s
  });
};

export const useSendConversationMessage = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      message, 
      attachments = [] 
    }: { 
      submissionId: string; 
      message: string; 
      attachments?: string[];
    }) => {
      if (!user || !profile) throw new Error('User not authenticated');
      
      // Insert conversation message
      const { error: conversationError } = await (supabase as any)
        .from('exercise_submissions_conversation')
        .insert([
          {
            submission_id: submissionId,
            sender_id: user.id,
            message,
            meta_data: { 
              type: 'message',
              attachments: attachments 
            },
            created_at: new Date().toISOString(),
          },
        ]);
      if (conversationError) throw conversationError;

      // Update latest_answer in exercise_submissions
      const { error: updateError } = await (supabase as any)
        .from('exercise_submissions')
        .update({
          latest_answer: profile.role
        })
        .eq('id', submissionId);
      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['submissionConversation', variables.submissionId]
      });
      queryClient.invalidateQueries({
        queryKey: ['submissions']
      });
    },
  });
}; 