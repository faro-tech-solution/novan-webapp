import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  Calendar,
  Award,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const StudentCourses = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState('all');

  // Mock data for student's enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: 'مبانی برنامه‌نویسی جاوااسکریپت',
      instructor: 'احمد محمدی',
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      duration: '۸ ساعت',
      difficulty: 'مبتدی',
      category: 'برنامه‌نویسی',
      thumbnail: '/placeholder.svg',
      enrollDate: '۱۴۰۳/۰۵/۱۵',
      nextLesson: 'توابع در جاوااسکریپت',
      status: 'active'
    },
    {
      id: 2,
      title: 'طراحی رابط کاربری با React',
      instructor: 'مریم حسینی',
      progress: 45,
      totalLessons: 32,
      completedLessons: 14,
      duration: '۱۲ ساعت',
      difficulty: 'متوسط',
      category: 'فرانت‌اند',
      thumbnail: '/placeholder.svg',
      enrollDate: '۱۴۰۳/۰۶/۰۱',
      nextLesson: 'State Management',
      status: 'active'
    },
    {
      id: 3,
      title: 'CSS پیشرفته و انیمیشن',
      instructor: 'علی رضایی',
      progress: 100,
      totalLessons: 18,
      completedLessons: 18,
      duration: '۶ ساعت',
      difficulty: 'متوسط',
      category: 'طراحی',
      thumbnail: '/placeholder.svg',
      enrollDate: '۱۴۰۳/۰۴/۲۰',
      nextLesson: null,
      status: 'completed'
    },
    {
      id: 4,
      title: 'Node.js و توسعه بک‌اند',
      instructor: 'سارا احمدی',
      progress: 25,
      totalLessons: 28,
      completedLessons: 7,
      duration: '۱۵ ساعت',
      difficulty: 'پیشرفته',
      category: 'بک‌اند',
      thumbnail: '/placeholder.svg',
      enrollDate: '۱۴۰۳/۰۶/۱۰',
      nextLesson: 'Express.js مقدمات',
      status: 'active'
    }
  ];

  const filteredCourses = enrolledCourses.filter(course => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل دوره‌ها</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در حال مطالعه</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrolledCourses.filter(c => c.status === 'active').length}
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
                {enrolledCourses.filter(c => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین پیشرفت</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)}%
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
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>پیشرفت</span>
                      <span>{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} className="h-2" />
                    <div className="text-xs text-gray-600 mt-1">
                      {course.completedLessons} از {course.totalLessons} درس
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{course.enrollDate}</span>
                    </div>
                  </div>

                  {/* Next Lesson */}
                  {course.nextLesson && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm font-medium text-blue-900">درس بعدی:</div>
                      <div className="text-sm text-blue-700">{course.nextLesson}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 space-x-reverse">
                    <Link to={`/course/${course.id}`} className="flex-1">
                      <Button className="w-full">
                        {course.status === 'completed' ? 'مرور دوره' : 'ادامه مطالعه'}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      جزئیات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
