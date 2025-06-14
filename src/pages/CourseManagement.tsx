import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, Search, MoreHorizontal, UserPlus, Pencil, Trash2, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import EditCourseDialog from '@/components/EditCourseDialog';
import CourseTermsManagement from '@/components/CourseTermsManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description: string | null;
  instructor_name: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  enrolled_at: string;
  status: string;
  course?: {
    name: string;
  };
}

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Get enrollment counts for each course
      const coursesWithCounts = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('status', 'active');

          return {
            ...course,
            student_count: count || 0,
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری درس‌ها',
        variant: 'destructive',
      });
    }
  };

  const fetchEnrollments = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses!inner(name, instructor_id)
        `)
        .eq('courses.instructor_id', profile.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      const enrollmentsWithCourse = data?.map(enrollment => ({
        ...enrollment,
        course: { name: (enrollment as any).courses.name }
      })) || [];

      setEnrollments(enrollmentsWithCourse);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری ثبت‌نام‌ها',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchEnrollments()]);
      setLoading(false);
    };

    if (profile) {
      loadData();
    }
  }, [profile]);

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditDialog(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const handleManageTerms = (course: Course) => {
    setSelectedCourse(course);
    setShowTermsDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;

    // Check if course has students
    if (selectedCourse.student_count && selectedCourse.student_count > 0) {
      toast({
        title: 'خطا',
        description: 'نمی‌توانید درسی را که دانشجو دارد حذف کنید',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', selectedCourse.id);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'درس با موفقیت حذف شد',
      });

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'خطا',
        description: 'خطا در حذف درس',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedCourse(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'upcoming': return 'آینده';
      case 'completed': return 'تکمیل شده';
      case 'inactive': return 'غیرفعال';
      default: return status;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseCreated = () => {
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    fetchCourses();
  };

  if (loading) {
    return (
      <DashboardLayout title="مدیریت درس‌ها">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت درس‌ها">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">درس‌ها</h2>
            <p className="text-gray-600">مدیریت درس‌ها و دانشجویان شما</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            ایجاد درس
          </Button>
        </div>

        {/* Courses Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>
                      مربی: {course.instructor_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(course.status)}>
                      {getStatusText(course.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-md">
                        <DropdownMenuItem 
                          onClick={() => handleManageTerms(course)}
                          className="cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          مدیریت ترم‌ها
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEditCourse(course)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCourse(course)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">دانشجویان:</span>
                    <span className="font-medium">{course.student_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">حداکثر ظرفیت:</span>
                    <span className="font-medium">
                      {course.max_students === 0 || course.max_students === null ? 'نامحدود' : course.max_students}
                    </span>
                  </div>
                  {course.description && (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{course.description}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-1" />
                      مشاهده دانشجویان
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {courses.length === 0 && (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">هنوز درسی ایجاد نکرده‌اید</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                ایجاد اولین درس
              </Button>
            </div>
          )}
        </div>

        {/* Terms Management Dialog */}
        {selectedCourse && showTermsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">مدیریت ترم‌های {selectedCourse.name}</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTermsDialog(false)}
                  >
                    بستن
                  </Button>
                </div>
                <CourseTermsManagement 
                  courseId={selectedCourse.id}
                  courseName={selectedCourse.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Students Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>دانشجویان</CardTitle>
                <CardDescription>مدیریت ثبت‌نام دانشجویان و وضعیت آن‌ها</CardDescription>
              </div>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                ثبت‌نام دانشجو
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="جستجوی دانشجویان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>درس</TableHead>
                  <TableHead>تاریخ ثبت‌نام</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.student_name}</TableCell>
                    <TableCell>{enrollment.student_email}</TableCell>
                    <TableCell>{enrollment.course?.name || 'نامشخص'}</TableCell>
                    <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {getStatusText(enrollment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        مشاهده پروفایل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEnrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'هیچ دانشجویی یافت نشد' : 'هنوز دانشجویی ثبت‌نام نکرده'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCourseCreated={handleCourseCreated}
      />

      {/* Edit Course Dialog */}
      {selectedCourse && (
        <EditCourseDialog 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          course={selectedCourse}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف درس</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید درس "{selectedCourse?.name}" را حذف کنید؟
              {selectedCourse?.student_count && selectedCourse.student_count > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  این درس {selectedCourse.student_count} دانشجو دارد و قابل حذف نیست.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCourse}
              disabled={selectedCourse?.student_count ? selectedCourse.student_count > 0 : false}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CourseManagement;
