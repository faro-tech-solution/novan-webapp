
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';
import { CreateExerciseForm, CreateExerciseFormData } from './exercises/CreateExerciseForm';

interface CreateExerciseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExerciseCreated?: () => void;
}

const CreateExerciseDialog = ({ open: controlledOpen, onOpenChange, onExerciseCreated }: CreateExerciseDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { courses, createExercise } = useExercises();
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const onSubmit = useCallback(async (data: CreateExerciseFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Creating new exercise:', data);
      console.log('Available courses:', courses);
      
      // Calculate open date and close date based on days_to_open and days_duration
      const openDate = new Date();
      openDate.setDate(openDate.getDate() + data.days_to_open);
      
      const closeDate = new Date(openDate);
      closeDate.setDate(closeDate.getDate() + data.days_duration);
      
      const exerciseData = {
        title: data.title,
        description: data.description,
        course_id: data.course_id,
        difficulty: data.difficulty,
        due_date: closeDate.toISOString().split('T')[0],
        open_date: openDate.toISOString().split('T')[0],
        close_date: closeDate.toISOString().split('T')[0],
        points: data.points,
        estimated_time: data.estimated_time,
      };
      
      const { error } = await createExercise(exerciseData);
      
      if (error) {
        toast({
          title: "خطا",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "تمرین ایجاد شد",
        description: "تمرین جدید با موفقیت ایجاد شد",
      });
      
      setOpen(false);
      
      if (onExerciseCreated) {
        onExerciseCreated();
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast({
        title: "خطا",
        description: "خطا در ایجاد تمرین",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [courses, createExercise, toast, setOpen, onExerciseCreated]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const DialogComponent = useCallback(() => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>ایجاد تمرین جدید</DialogTitle>
        <DialogDescription>
          اطلاعات تمرین جدید را وارد کنید
        </DialogDescription>
      </DialogHeader>
      
      <CreateExerciseForm
        courses={courses}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={handleCancel}
      />
    </DialogContent>
  ), [courses, isSubmitting, onSubmit, handleCancel]);

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
