
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'نام درس الزامی است'),
  description: z.string().optional(),
  maxStudents: z.number().min(0, 'حداکثر تعداد دانشجویان نمی‌تواند منفی باشد').default(0),
  instructorId: z.string().min(1, 'انتخاب مربی الزامی است'),
  status: z.string().min(1, 'انتخاب وضعیت الزامی است'),
});

type FormData = z.infer<typeof formSchema>;

interface Course {
  id: string;
  name: string;
  description: string | null;
  max_students: number | null;
  instructor_id: string;
  status: string;
}

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onCourseUpdated: () => void;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

const EditCourseDialog = ({ open, onOpenChange, course, onCourseUpdated }: EditCourseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 0,
      instructorId: '',
      status: '',
    },
  });

  // Fetch instructors when dialog opens
  useEffect(() => {
    if (open) {
      fetchInstructors();
    }
  }, [open]);

  useEffect(() => {
    if (course && open) {
      form.reset({
        name: course.name,
        description: course.description || '',
        maxStudents: course.max_students || 0,
        instructorId: course.instructor_id,
        status: course.status,
      });
    }
  }, [course, open, form]);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'trainer');

      if (error) throw error;

      setInstructors(data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری لیست مربیان',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Get selected instructor details
      const selectedInstructor = instructors.find(inst => inst.id === data.instructorId);
      
      const { error } = await supabase
        .from('courses')
        .update({
          name: data.name,
          description: data.description,
          max_students: data.maxStudents,
          instructor_id: data.instructorId,
          instructor_name: selectedInstructor?.name || 'Unknown',
          status: data.status,
        })
        .eq('id', course.id);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'درس با موفقیت به‌روزرسانی شد',
      });

      onOpenChange(false);
      onCourseUpdated();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'خطا',
        description: 'خطا در به‌روزرسانی درس',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ویرایش درس</DialogTitle>
          <DialogDescription>
            اطلاعات درس را ویرایش کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام درس</FormLabel>
                  <FormControl>
                    <Input placeholder="نام درس را وارد کنید" {...field} />
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
                      placeholder="توضیحات درس را وارد کنید"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مربی</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="مربی را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name} ({instructor.email})
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وضعیت درس</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="وضعیت را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
                      <SelectItem value="upcoming">آینده</SelectItem>
                      <SelectItem value="preregister">پیش‌ثبت‌نام</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حداکثر تعداد دانشجویان (0 = نامحدود)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                لغو
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی درس'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
