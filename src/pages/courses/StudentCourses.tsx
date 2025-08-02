import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Play,
  Award,
  Filter,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStudentCoursesQuery } from '@/hooks/queries/useStudentCoursesQuery';
import { useToast } from '@/hooks/use-toast';

const StudentCourses = () => {
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const { data: courses = [], isLoading, error, refetch } = useStudentCoursesQuery();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    if (filter === 'active') return course.status === 'active';
    if (filter === 'completed') return course.status === 'completed';
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'مبتدی': return 'bg-green-100 text-green-800';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800';
      case 'پیشرفته': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRetry = async () => {
    try {
      await refetch();
      toast({
        title: 'بروزرسانی',
        description: 'دوره‌ها با موفقیت بروزرسانی شدند',
      });
    } catch {
      toast({
        title: 'خطا',
        description: 'خطا در بروزرسانی دوره‌ها',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="دوره‌های من">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">در حال بارگذاری...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="دوره‌های من">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error instanceof Error ? error.message : 'خطا در دریافت دوره‌ها'}</div>
          <Button onClick={handleRetry}>
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (courses.length === 0) {
    return (
      <DashboardLayout title="دوره‌های من">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            هیچ دوره‌ای یافت نشد
          </h3>
          <p className="text-gray-600 mb-4">
            در این بخش دوره‌ای وجود ندارد
          </p>
          <Link to="/courses">
            <Button>
              مشاهده دوره‌های موجود
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="دوره‌های من">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">دوره‌های من</h2>
            <p className="text-gray-600">دوره‌هایی که در آن‌ها ثبت‌نام کرده‌اید</p>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">همه دوره‌ها</option>
              <option value="active">در حال مطالعه</option>
              <option value="completed">تکمیل شده</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل دوره‌ها</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در حال مطالعه</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 space-x-reverse">
                      <Users className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status === 'active' ? 'در حال مطالعه' : 'تکمیل شده'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Actions */}
                  <div className="flex space-x-2 space-x-reverse">
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      جزئیات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Details Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse?.title}</DialogTitle>
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">مدرس</h3>
                    <p className="text-gray-600">{selectedCourse.instructor}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">سطح</h3>
                    <p className="text-gray-600">{selectedCourse.difficulty}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">دسته‌بندی</h3>
                    <p className="text-gray-600">{selectedCourse.category}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">وضعیت</h3>
                    <p className="text-gray-600">
                      {selectedCourse.status === 'active' ? 'در حال مطالعه' : 'تکمیل شده'}
                    </p>
                  </div>
                </div>

                {selectedCourse.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">توضیحات دوره</h3>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
