import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { TimeSelector } from '@/components/ui/time-selector';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';
import { Clock, Award } from 'lucide-react';

interface TimingAndPointsSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const TimingAndPointsSection = ({ form }: TimingAndPointsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <FormField
        control={form.control}
        name="points"
        render={({ field }) => {
          const displayedPoints =
            typeof field.value === 'number' && !Number.isNaN(field.value)
              ? field.value
              : 5;
          return (
          <FormItem>
            <FormLabel className="flex items-center">
              <Award className="h-4 w-4 ml-1" />
              امتیاز
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>۲۵۰</span>
                  <span className="font-medium text-gray-900">{displayedPoints}</span>
                  <span>۱</span>
                </div>
                <Slider
                  min={1}
                  max={250}
                  step={1}
                  value={[displayedPoints]}
                  onValueChange={(val) => field.onChange(val[0])}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="estimated_time"
        render={({ field }) => {
          const numericValue = typeof field.value === 'number' ? field.value : 0;
          return (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              زمان تخمینی
            </FormLabel>
            <FormControl>
              <TimeSelector
                value={numericValue}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}}
      />
    </div>
  );
};
