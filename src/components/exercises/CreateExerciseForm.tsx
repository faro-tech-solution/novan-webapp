import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from './BasicInfoSection';
import { CourseAndDifficultySection } from './CourseAndDifficultySection';
import { TimingAndPointsSection } from './TimingAndPointsSection';
import { FormBuilder } from './FormBuilder';
import { Course } from '@/types/exercise';
import { ExerciseForm } from '@/types/formBuilder';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(1, 'عنوان تمرین الزامی است'),
  description: z.string().optional(),
  course_id: z.string().min(1, 'انتخاب دوره الزامی است'),
  difficulty: z.string().min(1, 'انتخاب سطح دشواری الزامی است'),
  days_to_open: z.number().min(0, 'روز شروع باید 0 یا بیشتر باشد'),
  days_duration: z.number().min(1, 'مدت زمان باید حداقل 1 روز باشد'),
  points: z.number().min(0, 'امتیاز باید 0 یا بیشتر باشد'),
  estimated_time: z.string().min(1, 'زمان تخمینی الزامی است'),
  form_structure: z.object({
    questions: z.array(z.any())
  }).transform((val) => val as ExerciseForm)
});

export type CreateExerciseFormData = z.infer<typeof formSchema>;

interface CreateExerciseFormProps {
  courses: Course[];
  isSubmitting: boolean;
  onSubmit: (data: CreateExerciseFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: CreateExerciseFormData;
}

export const CreateExerciseForm = ({ courses, isSubmitting, onSubmit, onCancel, defaultValues }: CreateExerciseFormProps) => {
  const form = useForm<CreateExerciseFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: defaultValues || {
      title: '',
      description: '',
      course_id: '',
      difficulty: '',
      days_to_open: 1,
      days_duration: 7,
      points: 100,
      estimated_time: '',
      form_structure: { questions: [] },
    },
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

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
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <BasicInfoSection form={form} />
        <CourseAndDifficultySection form={form} courses={courses} />
        <TimingAndPointsSection form={form} />

        {/* Form Builder Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">محتوای تمرین</h3>
          <FormBuilder
            value={form.watch('form_structure')}
            onChange={(formStructure) => form.setValue('form_structure', formStructure)}
          />
        </div>

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
            {isSubmitting ? 'در حال ذخیره...' : (defaultValues ? 'ذخیره تغییرات' : 'ایجاد تمرین')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
