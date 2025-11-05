import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStableAuth } from '@/hooks/useStableAuth';
import {
  fetchQuizQuestions,
  fetchQuizQuestionsByCategory,
  fetchQuizQuestionsByExercise,
  fetchQuizQuestionsWithStats,
  fetchQuizQuestionById,
  createQuizQuestion,
  bulkCreateQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuizQuestionCount,
  CreateQuizQuestionData,
  UpdateQuizQuestionData
} from '@/services/quizQuestionService';
import { QuizQuestion, QuizQuestionWithStats } from '@/types/quiz';

export const useQuizQuestionsQuery = (courseId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['quiz-questions', courseId],
    queryFn: async () => await fetchQuizQuestions(courseId),
    enabled: enabled && isQueryEnabled && !!courseId,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: CreateQuizQuestionData & { created_by: string }) => {
      if (!questionData.created_by) {
        throw new Error('Creator ID is required');
      }
      return await createQuizQuestion(questionData, questionData.created_by);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    },
  });

  const bulkCreateQuestionsMutation = useMutation({
    mutationFn: async (questionsData: Array<CreateQuizQuestionData & { created_by: string }>) => {
      return await bulkCreateQuizQuestions(questionsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ 
      questionId, 
      questionData 
    }: { 
      questionId: string; 
      questionData: UpdateQuizQuestionData 
    }) => {
      return await updateQuizQuestion(questionId, questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return await deleteQuizQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    },
  });

  return {
    questions: questionsQuery.data || [],
    loading: questionsQuery.isLoading,
    error: questionsQuery.error,
    createQuestion: createQuestionMutation.mutateAsync,
    bulkCreateQuestions: bulkCreateQuestionsMutation.mutateAsync,
    updateQuestion: updateQuestionMutation.mutateAsync,
    deleteQuestion: deleteQuestionMutation.mutateAsync,
    isCreating: createQuestionMutation.isPending,
    isBulkCreating: bulkCreateQuestionsMutation.isPending,
    isUpdating: updateQuestionMutation.isPending,
    isDeleting: deleteQuestionMutation.isPending,
    refetch: questionsQuery.refetch,
  };
};

export const useQuizQuestionsByCategory = (categoryId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-questions-category', categoryId],
    queryFn: async () => await fetchQuizQuestionsByCategory(categoryId),
    enabled: enabled && isQueryEnabled && !!categoryId,
  });
};

export const useQuizQuestionsByExercise = (exerciseId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-questions-exercise', exerciseId],
    queryFn: async () => await fetchQuizQuestionsByExercise(exerciseId),
    enabled: enabled && isQueryEnabled && !!exerciseId,
  });
};

export const useQuizQuestionsWithStats = (courseId: string, studentId?: string, enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-questions-stats', courseId, studentId || user?.id],
    queryFn: async () => await fetchQuizQuestionsWithStats(courseId, studentId || user?.id),
    enabled: enabled && isQueryEnabled && !!courseId,
  });
};

export const useQuizQuestionById = (questionId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-question', questionId],
    queryFn: async () => await fetchQuizQuestionById(questionId),
    enabled: enabled && isQueryEnabled && !!questionId,
  });
};

export const useQuizQuestionCount = (courseId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-question-count', courseId],
    queryFn: async () => await getQuizQuestionCount(courseId),
    enabled: enabled && isQueryEnabled && !!courseId,
  });
};
