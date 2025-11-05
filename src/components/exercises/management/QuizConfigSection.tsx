import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateExerciseFormData } from "./CreateExerciseForm";

interface QuizConfigSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const QuizConfigSection = ({ form }: QuizConfigSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="quiz_config.quiz_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع آزمون</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || 'chapter'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="نوع آزمون را انتخاب کنید" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="chapter">آزمون فصل</SelectItem>
                <SelectItem value="progress">آزمون پیشرفت</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              آزمون فصل: فقط سوالات فصل فعلی | آزمون پیشرفت: سوالات همه فصل‌ها تا اینجا
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="quiz_config.min_questions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>حداقل سوالات</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="5"
                  max="10"
                  placeholder="5"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quiz_config.max_questions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>حداکثر سوالات</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="5"
                  max="10"
                  placeholder="10"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="quiz_config.passing_score"
        render={({ field }) => (
          <FormItem>
            <FormLabel>حد نصاب قبولی (درصد)</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="60"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
