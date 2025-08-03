import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useCoursesQuery,
  useUpdateExerciseMutation,
} from "@/hooks/useExercisesQuery";
import {
  CreateExerciseForm,
  CreateExerciseFormData,
} from "./CreateExerciseForm";
import { Exercise } from "@/types/exercise";

interface EditExerciseDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditExerciseDialog = ({
  exercise,
  open,
  onOpenChange,
}: EditExerciseDialogProps) => {
  const { toast } = useToast();
  const { data: courses = [] } = useCoursesQuery();
  const updateExerciseMutation = useUpdateExerciseMutation();

  const onSubmit = useCallback(
    async (data: CreateExerciseFormData) => {
      if (!exercise) return;

      try {
        const exerciseData = {
          title: data.title,
          description: data.description,
          course_id: data.course_id,
          difficulty: data.difficulty,

          points: data.points,
          estimated_time: data.estimated_time,
          exercise_type: data.exercise_type,
          content_url: data.content_url,
          auto_grade: data.auto_grade,
          form_structure: data.form_structure,
        };

        await updateExerciseMutation.mutateAsync({
          exerciseId: exercise.id,
          exerciseData,
        });

        toast({
          title: "به‌روزرسانی تمرین",
          description: "تمرین با موفقیت به‌روزرسانی شد",
        });

        onOpenChange(false);
      } catch (error) {
        console.error("Error updating exercise:", error);
        toast({
          title: "خطا",
          description:
            error instanceof Error ? error.message : "خطا در به‌روزرسانی تمرین",
          variant: "destructive",
        });
      }
    },
    [exercise, toast, onOpenChange, updateExerciseMutation]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Convert exercise data to form data format
  const getFormDefaultValues = useCallback(():
    | CreateExerciseFormData
    | undefined => {
    if (!exercise) return undefined;

    return {
      title: exercise.title,
      description: exercise.description || "",
      course_id: exercise.course_id || "",
      difficulty: exercise.difficulty,

      points: exercise.points,
      estimated_time: exercise.estimated_time,
      exercise_type: exercise.exercise_type || "form",
      content_url: exercise.content_url || null,
      auto_grade: exercise.auto_grade || false,
      form_structure: (typeof exercise.form_structure === 'object' && exercise.form_structure !== null ? exercise.form_structure : { questions: [] }) as any,
    };
  }, [exercise]);

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>ویرایش تمرین</DialogTitle>
          <DialogDescription>اطلاعات تمرین را ویرایش کنید</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <CreateExerciseForm
            courses={courses}
            isSubmitting={updateExerciseMutation.isPending}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            defaultValues={getFormDefaultValues()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
