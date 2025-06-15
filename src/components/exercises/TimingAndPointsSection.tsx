
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';
import { Calendar, Clock, Award } from 'lucide-react';

interface TimingAndPointsSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const TimingAndPointsSection = ({ form }: TimingAndPointsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FormField
        control={form.control}
        name="days_to_open"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Calendar className="h-4 w-4 ml-1" />
              روز باز شدن
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="5"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="days_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              مدت زمان (روز)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="7"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="points"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Award className="h-4 w-4 ml-1" />
              امتیاز
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="100"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimated_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              زمان تخمینی
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="۲ ساعت" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
