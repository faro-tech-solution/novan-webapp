
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';
import { Course } from '@/types/exercise';

interface CourseAndDifficultySectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
  courses: Course[];
}

export const CourseAndDifficultySection = ({ form, courses }: CourseAndDifficultySectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="course_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دوره</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دوره" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {courses.length === 0 ? (
                  <SelectItem value="no-courses" disabled>
                    هیچ دوره فعالی یافت نشد
                  </SelectItem>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>سطح دشواری</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب سطح" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="آسان">آسان</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="سخت">سخت</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
