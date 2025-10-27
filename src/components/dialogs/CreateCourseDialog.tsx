import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Instructor } from '@/types/instructor';

const formSchema = z.object({
  name: z.string().min(1, 'نام درس الزامی است'),
  description: z.string().optional(),
  maxStudents: z.number().min(0, 'حداکثر تعداد دانشجویان نمی‌تواند منفی باشد').default(50),
  instructorId: z.string().min(1, 'انتخاب مربی الزامی است'),
  status: z.string().min(1, 'انتخاب وضعیت الزامی است'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد').default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: () => void;
}

const CreateCourseDialog = ({ open, onOpenChange, onCourseCreated }: CreateCourseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 50,
      instructorId: '',
              status: 'active',
      price: 0,
    },
  });

  // Fetch instructors when dialog opens
  useEffect(() => {
    if (open) {
      fetchInstructors();
    }
  }, [open]);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
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

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const onSubmit = async (data: FormData) => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          name: data.name,
          description: data.description,
          instructor_id: data.instructorId,
          max_students: data.maxStudents,
          status: data.status,
          price: data.price,
          slug: generateSlug(data.name),
        });

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'درس با موفقیت ایجاد شد',
      });

      form.reset();
      onOpenChange(false);
      onCourseCreated();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ایجاد درس',
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
          <DialogTitle>ایجاد درس جدید</DialogTitle>
          <DialogDescription>
            اطلاعات درس جدید را وارد کنید
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
                    <RichTextEditor 
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="توضیحات درس را وارد کنید"
                      height="120px"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="مربی را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.first_name} {instructor.last_name} ({instructor.email})
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="وضعیت را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
          
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
                      placeholder="50"
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت (تومان)</FormLabel>
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
                {loading ? 'در حال ایجاد...' : 'ایجاد درس'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
