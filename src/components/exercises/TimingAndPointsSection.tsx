import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
          const suggestions: { label: string; seconds: number }[] = [
            { label: '۱۵ دقیقه', seconds: 15 * 60 },
            { label: '۳۰ دقیقه', seconds: 30 * 60 },
            { label: '۱ ساعت', seconds: 60 * 60 },
          ];
          const numericValue = typeof field.value === 'number' ? field.value : 0;
          return (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              زمان تخمینی (ثانیه)
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-3 gap-3 items-start">
                <div className="col-span-3 md:col-span-1">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={numericValue}
                    onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    required
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <Button
                        key={s.seconds}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(s.seconds)}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}}
      />
    </div>
  );
};
