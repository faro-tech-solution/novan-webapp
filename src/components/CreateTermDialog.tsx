
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'نام ترم الزامی است'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxStudents: z.number().min(0, 'حداکثر تعداد دانشجویان نمی‌تواند منفی باشد').default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onTermCreated: () => void;
}

const CreateTermDialog = ({ open, onOpenChange, courseId, onTermCreated }: CreateTermDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      maxStudents: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('course_terms')
        .insert({
          course_id: courseId,
          name: data.name,
          start_date: data.startDate || null,
          end_date: data.endDate || null,
          max_students: data.maxStudents,
        });

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'ترم با موفقیت ایجاد شد',
      });

      form.reset();
      onOpenChange(false);
      onTermCreated();
    } catch (error) {
      console.error('Error creating term:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ایجاد ترم',
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
          <DialogTitle>ایجاد ترم جدید</DialogTitle>
          <DialogDescription>
            اطلاعات ترم جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام ترم</FormLabel>
                  <FormControl>
                    <Input placeholder="نام ترم را وارد کنید" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ شروع</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ پایان</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                {loading ? 'در حال ایجاد...' : 'ایجاد ترم'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTermDialog;
