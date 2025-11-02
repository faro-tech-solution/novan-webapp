import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCoursesQuery } from "@/hooks/queries/useCoursesQuery";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import {
  CreateExerciseForm,
  CreateExerciseFormData,
} from "@/components/exercises";

interface CreateExerciseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateExerciseDialog = ({
  open: controlledOpen,
  onOpenChange,
}: CreateExerciseDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const { courses = [] } = useCoursesQuery();
  const { createExercise, isCreating } = useExercisesQuery();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const onSubmit = useCallback(
    async (data: CreateExerciseFormData) => {
      try {
        const exerciseData = {
          title: data.title,
          description: data.description || null,
          course_id: data.course_id,
          difficulty: data.difficulty || null,

          points: data.points,
          estimated_time: String(data.estimated_time ?? 0),
          exercise_type: data.exercise_type,
          content_url: data.content_url,
          auto_grade: data.auto_grade,
          form_structure: data.form_structure || { questions: [] },
          is_exercise: data.is_exercise !== undefined ? data.is_exercise : false,
          transcription: data.transcription || null,
        };

        await createExercise(exerciseData);

        toast({
          title: "تمرین ایجاد شد",
          description: "تمرین جدید با موفقیت ایجاد شد",
        });

        setOpen(false);
      } catch (error) {
        console.error("Error creating exercise:", error);
        toast({
          title: "خطا",
          description:
            error instanceof Error ? error.message : "خطا در ایجاد تمرین",
          variant: "destructive",
        });
      }
    },
    [createExercise, setOpen, toast]
  );

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const DialogComponent = useCallback(
    () => (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>ایجاد تمرین جدید</DialogTitle>
          <DialogDescription>اطلاعات تمرین جدید را وارد کنید</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <CreateExerciseForm
            courses={courses}
            isSubmitting={isCreating}
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    ),
    [courses, isCreating, onSubmit, handleCancel]
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogComponent />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          تمرین جدید
        </Button>
      </DialogTrigger>
      <DialogComponent />
    </Dialog>
  );
};

export default CreateExerciseDialog;
