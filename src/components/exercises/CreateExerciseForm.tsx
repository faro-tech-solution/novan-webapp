
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from './BasicInfoSection';
import { CourseAndDifficultySection } from './CourseAndDifficultySection';
import { TimingAndPointsSection } from './TimingAndPointsSection';
import { Course } from '@/types/exercise';

export interface CreateExerciseFormData {
  title: string;
  description: string;
  course_id: string;
  difficulty: string;
  days_to_open: number;
  days_duration: number;
  points: number;
  estimated_time: string;
}

interface CreateExerciseFormProps {
  courses: Course[];
  isSubmitting: boolean;
  onSubmit: (data: CreateExerciseFormData) => Promise<void>;
  onCancel: () => void;
}

export const CreateExerciseForm = ({ courses, isSubmitting, onSubmit, onCancel }: CreateExerciseFormProps) => {
  const form = useForm<CreateExerciseFormData>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      course_id: '',
      difficulty: '',
      days_to_open: 1,
      days_duration: 7,
      points: 100,
      estimated_time: '',
    },
  });

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit]);

  const handleCancel = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  }, [onCancel]);

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <BasicInfoSection form={form} />
        <CourseAndDifficultySection form={form} courses={courses} />
        <TimingAndPointsSection form={form} />

        <div className="flex justify-end space-x-2 space-x-reverse pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel} 
            disabled={isSubmitting}
          >
            انصراف
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'در حال ایجاد...' : 'ایجاد تمرین'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
