import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ExerciseQuestion, CreateQuestionData } from '@/types/exerciseQA';
import {
  fetchQuestions,
  fetchQuestionReplies,
  createQuestion,
  createReply,
  deleteQuestion,
  voteQuestion,
  getUserVote,
} from '@/services/exerciseQAService';

export const useExerciseQuestions = (exerciseId: string, courseId: string, enabled = true) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exerciseQuestions', exerciseId, courseId, user?.id],
    queryFn: async () => {
      const questions = await fetchQuestions(exerciseId, courseId);
      // Fetch user votes for each question
      if (user) {
        const questionsWithVotes = await Promise.all(
          questions.map(async (q) => {
            const vote = await getUserVote(q.id, user.id);
            return { ...q, user_vote: vote };
          })
        );
        return questionsWithVotes;
      }
      return questions;
    },
    enabled: enabled && !!exerciseId && !!courseId && !!user,
  });
};

export const useQuestionReplies = (questionId: string, enabled = true) => {
  return useQuery({
    queryKey: ['questionReplies', questionId],
    queryFn: () => fetchQuestionReplies(questionId),
    enabled: enabled && !!questionId,
  });
};

export const useUserVote = (questionId: string, userId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['userVote', questionId, userId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return getUserVote(questionId, userId);
    },
    enabled: enabled && !!questionId && !!userId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateQuestionData) => {
      if (!user) throw new Error('User not authenticated');
      return createQuestion(data, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['exerciseQuestions', variables.exercise_id, variables.course_id],
      });
      toast({
        title: 'سوال ثبت شد',
        description: 'سوال شما با موفقیت ثبت شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'خطا در ثبت سوال',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: { content: string; course_id: string } }) => {
      if (!user) throw new Error('User not authenticated');
      return createReply(questionId, data, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['questionReplies', variables.questionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['exerciseQuestions'],
      });
      toast({
        title: 'پاسخ ثبت شد',
        description: 'پاسخ شما با موفقیت ثبت شد',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error instanceof Error ? error.message : 'خطا در ثبت پاسخ',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionId: string) => {
      return deleteQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['exerciseQuestions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['questionReplies'],
      });
      toast({
        title: 'حذف شد',
        description: 'سوال/پاسخ با موفقیت حذف شد',
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

export const useVoteQuestion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ questionId, voteType }: { questionId: string; voteType: 'upvote' | 'downvote' }) => {
      if (!user) throw new Error('User not authenticated');
      return voteQuestion(questionId, user.id, voteType);
    },
    onMutate: async ({ questionId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['exerciseQuestions'] });
      await queryClient.cancelQueries({ queryKey: ['questionReplies'] });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData<ExerciseQuestion[]>(['exerciseQuestions']);

      // Optimistically update
      if (previousQuestions) {
        queryClient.setQueryData<ExerciseQuestion[]>(['exerciseQuestions'], (old) => {
          if (!old) return old;
          return old.map((q) => {
            if (q.id === questionId) {
              const currentUserVote = q.user_vote;
              let newUpvotes = q.upvotes;
              let newDownvotes = q.downvotes;

              if (currentUserVote === voteType) {
                // Remove vote
                if (voteType === 'upvote') newUpvotes--;
                else newDownvotes--;
                return { ...q, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: null };
              } else if (currentUserVote) {
                // Change vote
                if (voteType === 'upvote') {
                  newUpvotes++;
                  newDownvotes--;
                } else {
                  newUpvotes--;
                  newDownvotes++;
                }
                return { ...q, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: voteType };
              } else {
                // Add vote
                if (voteType === 'upvote') newUpvotes++;
                else newDownvotes++;
                return { ...q, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: voteType };
              }
            }
            return q;
          });
        });
      }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(['exerciseQuestions'], context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['questionReplies'] });
    },
  });
};
