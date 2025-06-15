
import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';
import { CreateExerciseForm, CreateExerciseFormData } from './CreateExerciseForm';
import { Exercise } from '@/types/exercise';

interface EditExerciseDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseUpdated?: () => void;
}

export const EditExerciseDialog = ({ exercise, open, onOpenChange, onExerciseUpdated }: EditExerciseDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { courses, updateExercise } = useExercises();

  const onSubmit = useCallback(async (data: CreateExerciseFormData) => {
    if (!exercise) return;

    try {
      setIsSubmitting(true);
      console.log('Updating exercise:', data);
      
      const exerciseData = {
        title: data.title,
        description: data.description,
        course_id: data.course_id,
        difficulty: data.difficulty,
        days_to_due: data.days_to_open + data.days_duration,
        days_to_open: data.days_to_open,
        days_to_close: data.days_to_open + data.days_duration,
        points: data.points,
        estimated_time: data.estimated_time,
        form_structure: data.form_structure,
      };
      
      const { error } = await updateExercise(exercise.id, exerciseData);
      
      if (error) {
        toast({
          title: "خطا",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "به‌روزرسانی تمرین",
        description: "تمرین با موفقیت به‌روزرسانی شد",
      });
      
      onOpenChange(false);
      
      if (onExerciseUpdated) {
        onExerciseUpdated();
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی تمرین",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [exercise, toast, onOpenChange, onExerciseUpdated, updateExercise]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Convert exercise data to form data format
  const getFormDefaultValues = useCallback((): CreateExerciseFormData | undefined => {
    if (!exercise) return undefined;

    const daysDuration = Math.max(1, exercise.days_to_close - exercise.days_to_open);

    return {
      title: exercise.title,
      description: exercise.description || '',
      course_id: exercise.course_name || '',
      difficulty: exercise.difficulty,
      days_to_open: exercise.days_to_open,
      days_duration: daysDuration,
      points: exercise.points,
      estimated_time: exercise.estimated_time,
      form_structure: exercise.form_structure || { questions: [] },
    };
  }, [exercise]);

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>ویرایش تمرین</DialogTitle>
          <DialogDescription>
            اطلاعات تمرین را ویرایش کنید
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2">
          <CreateExerciseForm
            courses={courses}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            defaultValues={getFormDefaultValues()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
