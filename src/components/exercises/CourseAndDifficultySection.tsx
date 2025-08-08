import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';
import { Course } from '@/types/course';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { useEffect } from 'react';

interface CourseAndDifficultySectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
  courses: Course[];
}

export const CourseAndDifficultySection = ({ form, courses }: CourseAndDifficultySectionProps) => {
  const selectedCourseId = form.watch("course_id");
  const exerciseType = form.watch("exercise_type");
  const { categories = [] } = useExerciseCategoriesQuery(selectedCourseId);
  
  // Reset category when course changes
  useEffect(() => {
    form.setValue("category_id", "no-category");
  }, [selectedCourseId, form]);
  
  const isMediaType = exerciseType === 'video' || exerciseType === 'audio' || exerciseType === 'iframe' || exerciseType === 'arvan_video';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="course_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دوره</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    <SelectItem key={course.id} value={course.id}>
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
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دسته‌بندی</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'no-category'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی (اختیاری)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-category">بدون دسته‌بندی</SelectItem>
                {categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    هیچ دسته‌بندی برای این دوره یافت نشد
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isMediaType && (
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>سطح دشواری</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
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
      )}
    </div>
  );
};
