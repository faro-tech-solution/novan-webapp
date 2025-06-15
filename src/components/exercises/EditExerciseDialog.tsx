
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
  const { courses } = useExercises();

  const onSubmit = useCallback(async (data: CreateExerciseFormData) => {
    if (!exercise) return;

    try {
      setIsSubmitting(true);
      console.log('Updating exercise:', data);
      
      // For now, we'll show a toast that the feature is coming soon
      // In a real implementation, you would call an updateExercise function
      toast({
        title: "به‌روزرسانی تمرین",
        description: "این قابلیت به زودی اضافه خواهد شد",
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
  }, [exercise, toast, onOpenChange, onExerciseUpdated]);

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
    };
  }, [exercise]);

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ویرایش تمرین</DialogTitle>
          <DialogDescription>
            اطلاعات تمرین را ویرایش کنید
          </DialogDescription>
        </DialogHeader>
        
        <CreateExerciseForm
          courses={courses}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={getFormDefaultValues()}
        />
      </DialogContent>
    </Dialog>
  );
};
