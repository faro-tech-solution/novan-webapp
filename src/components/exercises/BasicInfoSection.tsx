
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان تمرین</FormLabel>
            <FormControl>
              <Input 
                placeholder="مثال: مبانی React Hooks" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>توضیحات</FormLabel>
            <FormControl>
              <RichTextEditor 
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="توضیحات کاملی از تمرین ارائه دهید..."
                height="120px"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
