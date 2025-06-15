
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, Calendar, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';

interface CreateExerciseFormData {
  title: string;
  description: string;
  course_id: string;
  difficulty: string;
  days_to_open: number;
  days_duration: number;
  points: number;
  estimated_time: string;
}

interface CreateExerciseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExerciseCreated?: () => void;
}

const CreateExerciseDialog = ({ open: controlledOpen, onOpenChange, onExerciseCreated }: CreateExerciseDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { courses, createExercise } = useExercises();
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  
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

  const onSubmit = useCallback(async (data: CreateExerciseFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Creating new exercise:', data);
      console.log('Available courses:', courses);
      
      // Calculate open date and close date based on days_to_open and days_duration
      const openDate = new Date();
      openDate.setDate(openDate.getDate() + data.days_to_open);
      
      const closeDate = new Date(openDate);
      closeDate.setDate(closeDate.getDate() + data.days_duration);
      
      const exerciseData = {
        title: data.title,
        description: data.description,
        course_id: data.course_id,
        difficulty: data.difficulty,
        due_date: closeDate.toISOString().split('T')[0],
        open_date: openDate.toISOString().split('T')[0],
        close_date: closeDate.toISOString().split('T')[0],
        points: data.points,
        estimated_time: data.estimated_time,
      };
      
      const { error } = await createExercise(exerciseData);
      
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
      
      setOpen(false);
      form.reset();
      
      if (onExerciseCreated) {
        onExerciseCreated();
      }
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
  }, [courses, createExercise, toast, setOpen, form, onExerciseCreated]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)(e);
  }, [form, onSubmit]);

  const handleCancel = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  }, [setOpen]);

  const DialogComponent = useCallback(() => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>ایجاد تمرین جدید</DialogTitle>
        <DialogDescription>
          اطلاعات تمرین جدید را وارد کنید
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
    </DialogContent>
  ), [form, handleFormSubmit, handleCancel, isSubmitting, courses]);

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogComponent />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          تمرین جدید
        </Button>
      </DialogTrigger>
      <DialogComponent />
    </Dialog>
  );
};

export default CreateExerciseDialog;
