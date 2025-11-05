import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStableAuth } from '@/hooks/useStableAuth';
import {
  retakeQuiz,
  submitQuizAnswers,
  fetchQuizResults
} from '@/services/quizSubmissionService';
import { generateQuiz } from '@/services/quizGenerationService';
import {
  fetchQuizHistory,
  fetchQuizStatistics,
  fetchQuestionStatistics,
  fetchQuizProgressMetrics,
  fetchLatestQuizAttempt
} from '@/services/quizAnalyticsService';
import { GenerateQuizRequest, SubmitQuizRequest } from '@/types/quiz';

export const useQuizHistory = (courseId: string, quizType?: 'chapter' | 'progress', enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-history', courseId, quizType, user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await fetchQuizHistory(user.id, courseId, quizType);
    },
    enabled: enabled && isQueryEnabled && !!courseId && !!user,
  });
};

export const useQuizStatistics = (courseId: string, enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-statistics', courseId, user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          totalAttempts: 0,
          totalPassed: 0,
          averageScore: 0,
          bestScore: 0,
          lastAttemptDate: null
        };
      }
      return await fetchQuizStatistics(user.id, courseId);
    },
    enabled: enabled && isQueryEnabled && !!courseId && !!user,
  });
};

export const useQuestionStatistics = (courseId: string, studentId?: string, enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['question-statistics', courseId, studentId || user?.id],
    queryFn: async () => await fetchQuestionStatistics(courseId, studentId || user?.id),
    enabled: enabled && isQueryEnabled && !!courseId,
  });
};

export const useQuizProgressMetrics = (courseId: string, enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-progress-metrics', courseId, user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          totalQuizzes: 0,
          completedQuizzes: 0,
          passedQuizzes: 0,
          averageScore: 0,
          improvementTrend: 'stable' as const
        };
      }
      return await fetchQuizProgressMetrics(user.id, courseId);
    },
    enabled: enabled && isQueryEnabled && !!courseId && !!user,
  });
};

export const useLatestQuizAttempt = (courseId: string, enabled = true) => {
  const { user, isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['latest-quiz-attempt', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await fetchLatestQuizAttempt(user.id, courseId);
    },
    enabled: enabled && isQueryEnabled && !!courseId && !!user,
  });
};

export const useGenerateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateQuizRequest) => {
      return await generateQuiz(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SubmitQuizRequest) => {
      return await submitQuizAnswers(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-progress-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['question-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useRetakeQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attemptId, studentId }: { attemptId: string; studentId: string }) => {
      return await retakeQuiz(attemptId, studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useQuizResults = (attemptId: string, enabled = true) => {
  const { isQueryEnabled } = useStableAuth();

  return useQuery({
    queryKey: ['quiz-results', attemptId],
    queryFn: async () => await fetchQuizResults(attemptId),
    enabled: enabled && isQueryEnabled && !!attemptId,
  });
};
