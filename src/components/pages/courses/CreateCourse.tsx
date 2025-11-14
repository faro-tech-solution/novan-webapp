'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Instructor } from '@/types/instructor';
import { EditableCourse } from '@/types/course';
import PreviewDataBuilder from '@/components/courses/PreviewDataBuilder';
import { PreviewComponent } from '@/types/previewData';

const formSchema = z.object({
  name: z.string().min(1, 'نام درس الزامی است'),
  description: z.string().optional(),
  maxStudents: z.number().min(0, 'حداکثر تعداد دانشجویان نمی‌تواند منفی باشد').default(50),
  instructorId: z.string().min(1, 'انتخاب مربی الزامی است'),
  status: z.string().min(1, 'انتخاب وضعیت الزامی است'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد').default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCourseProps {
  courseId?: string;
}

const CreateCourse = ({ courseId }: CreateCourseProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [course, setCourse] = useState<EditableCourse | null>(null);
  const [previewData, setPreviewData] = useState<PreviewComponent[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Helper function to strip HTML tags from text
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    // Create a temporary div element to parse HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Get text content and clean up whitespace
    return tmp.textContent || tmp.innerText || '';
  };

  // Fetch course data if in edit mode
  useEffect(() => {
    if (courseId) {
      setFetchingCourse(true);
      fetchCourseData(courseId);
    }
  }, [courseId]);

  // Fetch instructors on mount
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Update form when course data is loaded
  useEffect(() => {
    if (course) {
      // Strip HTML tags from description if present
      const plainDescription = course.description ? stripHtmlTags(course.description) : '';
      form.reset({
        name: course.name,
        description: plainDescription,
        maxStudents: course.max_students || 0,
        instructorId: course.instructor_id,
        status: course.status,
        price: course.price || 0,
      });

      // Load preview_data if it exists
      if ((course as any).preview_data) {
        try {
          const previewDataValue = (course as any).preview_data;
          // Check if it's the new format with components array
          if (previewDataValue && previewDataValue.components && Array.isArray(previewDataValue.components)) {
            setPreviewData(previewDataValue.components);
          } else {
            // Legacy format or empty, start with empty array
            setPreviewData([]);
          }
        } catch (error) {
          console.error('Error parsing preview_data:', error);
          setPreviewData([]);
        }
      } else {
        setPreviewData([]);
      }
    }
  }, [course, form]);

  const fetchCourseData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCourse(data as EditableCourse);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری اطلاعات درس',
        variant: 'destructive',
      });
      router.push('/portal/admin/courses-management');
    } finally {
      setFetchingCourse(false);
    }
  };

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
      if (courseId) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            name: data.name,
            description: data.description,
            instructor_id: data.instructorId,
            max_students: data.maxStudents,
            status: data.status,
            price: data.price,
            preview_data: previewData.length > 0 ? ({ components: previewData } as any) : null,
          })
          .eq('id', courseId);

        if (error) throw error;

        toast({
          title: 'موفقیت',
          description: 'درس با موفقیت به‌روزرسانی شد',
        });
      } else {
        // Create new course
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
            preview_data: previewData.length > 0 ? ({ components: previewData } as any) : null,
          });

        if (error) throw error;

        toast({
          title: 'موفقیت',
          description: 'درس با موفقیت ایجاد شد',
        });
      }

      // Invalidate courses query to refresh data
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      // Redirect to courses management page
      router.push('/portal/admin/courses-management');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'خطا',
        description: courseId ? 'خطا در به‌روزرسانی درس' : 'خطا در ایجاد درس',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/portal/admin/courses-management');
  };

  if (fetchingCourse) {
    return (
      <DashboardLayout title={courseId ? 'ویرایش درس' : 'ایجاد درس جدید'}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={courseId ? 'ویرایش درس' : 'ایجاد درس جدید'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 font-yekanbakh">
              {courseId ? 'ویرایش درس' : 'ایجاد درس جدید'}
            </CardTitle>
            <CardDescription>
              {courseId ? 'اطلاعات درس را ویرایش کنید' : 'اطلاعات درس جدید را وارد کنید'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
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

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیحات</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="توضیحات درس را وارد کنید"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row: Teacher | Course State | Limitation | Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Teacher */}
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
                                {instructor.first_name} {instructor.last_name} ({instructor.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Course State */}
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
                            <SelectItem value="preregister">پیش‌ثبت‌نام</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Limitation */}
                  <FormField
                    control={form.control}
                    name="maxStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حداکثر تعداد دانشجویان</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0 = نامحدود"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
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
                </div>

                {/* Preview Data Builder */}
                <div className="pt-4 border-t">
                  <PreviewDataBuilder
                    value={previewData}
                    onChange={setPreviewData}
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    لغو
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading 
                      ? (courseId ? 'در حال به‌روزرسانی...' : 'در حال ایجاد...') 
                      : (courseId ? 'به‌روزرسانی درس' : 'ایجاد درس')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateCourse;

