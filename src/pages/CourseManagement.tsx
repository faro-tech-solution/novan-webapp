import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, MoreHorizontal, Pencil, Trash2, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import EditCourseDialog from '@/components/EditCourseDialog';
import CourseTermsManagement from '@/components/CourseTermsManagement';
import CourseStudentsDialog from '@/components/CourseStudentsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  instructor_name: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is trainer, only show their courses
      // If user is admin, show all courses
      if (profile.role === 'trainer') {
        query = query.eq('instructor_id', profile.id);
      }

      const { data: coursesData, error: coursesError } = await query;

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCourses();
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

  const handleViewStudents = (course: Course) => {
    setSelectedCourse(course);
    setShowStudentsDialog(true);
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

  const handleCourseCreated = () => {
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    fetchCourses();
  };

  // Determine if user can create courses (trainers can, admins cannot unless they're also trainers)
  const canCreateCourses = profile?.role === 'trainer';

  if (loading) {
    return (
      <DashboardLayout title={profile?.role === 'admin' ? 'مدیریت درس‌ها' : 'مدیریت درس‌ها'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={profile?.role === 'admin' ? 'مدیریت درس‌ها' : 'مدیریت درس‌ها'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.role === 'admin' ? 'تمام درس‌ها' : 'درس‌ها'}
            </h2>
            <p className="text-gray-600">
              {profile?.role === 'admin' 
                ? 'مدیریت تمام درس‌های سیستم' 
                : 'مدیریت درس‌ها و دانشجویان شما'
              }
            </p>
          </div>
          {canCreateCourses && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              ایجاد درس
            </Button>
          )}
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
                        {(profile?.role === 'trainer' && course.instructor_id === profile.id) && (
                          <>
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
                          </>
                        )}
                        {profile?.role === 'admin' && (
                          <>
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
                          </>
                        )}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewStudents(course)}
                    >
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
              <p className="text-gray-500">
                {profile?.role === 'admin' 
                  ? 'هنوز درسی در سیستم ایجاد نشده است' 
                  : 'هنوز درسی ایجاد نکرده‌اید'
                }
              </p>
              {canCreateCourses && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ایجاد اولین درس
                </Button>
              )}
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
      </div>

      {/* Create Course Dialog */}
      {canCreateCourses && (
        <CreateCourseDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {/* Edit Course Dialog */}
      {selectedCourse && (
        <EditCourseDialog 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          course={selectedCourse}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {/* Students Dialog */}
      {selectedCourse && (
        <CourseStudentsDialog
          open={showStudentsDialog}
          onOpenChange={setShowStudentsDialog}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
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
