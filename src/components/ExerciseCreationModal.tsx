
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';

interface ExerciseFormData {
  title: string;
  description: string;
  course_name: string;
  difficulty: string;
  due_date: string;
  points: number;
  estimated_time: string;
  status: string;
}

interface ExerciseCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExerciseCreationModal = ({ open, onOpenChange }: ExerciseCreationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createExercise } = useExercises();
  
  const form = useForm<ExerciseFormData>({
    defaultValues: {
      title: '',
      description: '',
      course_name: '',
      difficulty: '',
      due_date: '',
      points: 100,
      estimated_time: '',
      status: 'active',
    },
  });

  const courses = ['توسعه وب مقدماتی', 'توسعه وب پیشرفته', 'موبایل اپلیکیشن'];

  const onSubmit = async (data: ExerciseFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Creating new exercise:', data);
      
      const { error } = await createExercise(data);
      
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
      
      onOpenChange(false);
      form.reset();
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ایجاد تمرین جدید</DialogTitle>
          <DialogDescription>
            اطلاعات تمرین جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'عنوان الزامی است' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان تمرین</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: مبانی React Hooks" {...field} />
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
                    <Textarea 
                      placeholder="توضیحات کاملی از تمرین ارائه دهید..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="course_name"
                rules={{ required: 'انتخاب دوره الزامی است' }}
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
                        {courses.map((courseName) => (
                          <SelectItem key={courseName} value={courseName}>
                            {courseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                rules={{ required: 'انتخاب سطح دشواری الزامی است' }}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                rules={{ required: 'موعد تحویل الزامی است' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Calendar className="h-4 w-4 ml-1" />
                      موعد تحویل
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                rules={{ 
                  required: 'امتیاز الزامی است',
                  min: { value: 1, message: 'امتیاز باید حداقل ۱ باشد' }
                }}
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_time"
                rules={{ required: 'زمان تخمینی الزامی است' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Clock className="h-4 w-4 ml-1" />
                      زمان تخمینی
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="۲ ساعت" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                rules={{ required: 'انتخاب وضعیت الزامی است' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب وضعیت" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">فعال</SelectItem>
                        <SelectItem value="draft">پیش‌نویس</SelectItem>
                        <SelectItem value="completed">تکمیل شده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ایجاد...' : 'ایجاد تمرین'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCreationModal;
