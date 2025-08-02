import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchExerciseDetail, submitExerciseSolution } from '@/services/exerciseDetailService';
import { useToast } from '@/hooks/use-toast';
import { FormAnswer } from '@/types/formBuilder';

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
    }: {
      exerciseId: string;
      studentId: string;
      answers: FormAnswer[];
      courseId: string;
      feedback?: string;
    }) => {
      const result = await submitExerciseSolution(
        exerciseId,
        studentId,
        JSON.stringify(answers),
        courseId,
        feedback
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