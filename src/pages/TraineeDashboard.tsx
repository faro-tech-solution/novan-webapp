
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Award, Play, Calendar, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTraineeDashboard } from '@/hooks/useTraineeDashboard';
import { DailyTasksCard } from '@/components/dashboard/DailyTasksCard';
import { getDifficultyBadge, getExerciseStatusBadge } from '@/components/exercises/ExerciseStatusBadges';

const TraineeDashboard = () => {
  const { profile } = useAuth();
  const { stats, upcomingExercises, loading, error, refetch } = useTraineeDashboard();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <DashboardLayout title="داشبورد دانشجو">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری اطلاعات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="داشبورد دانشجو">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="داشبورد دانشجو">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2 font-peyda">خوش آمدید، {profile?.name}!</h2>
          <p className="opacity-90">کلاس: {profile?.className || 'نامشخص'}</p>
          <p className="opacity-90">
            شما {upcomingExercises.length} تمرین برای تکمیل دارید
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedExercises}</div>
              <p className="text-xs text-muted-foreground">تمرین تمام شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در انتظار بررسی</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingExercises}</div>
              <p className="text-xs text-muted-foreground">منتظر نمره</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عقب‌افتاده</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueExercises}</div>
              <p className="text-xs text-muted-foreground">تمرین دیرکرد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مجموع امتیاز</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">امتیاز کسب شده</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>تمرین‌های پیش رو</CardTitle>
              <CardDescription>تکالیف فعلی و آینده شما</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  تمرین جدیدی برای انجام وجود ندارد
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          {getStatusIcon(exercise.submission_status)}
                          <h4 className="font-medium">{exercise.title}</h4>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-2">
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="h-3 w-3" />
                            <span>موعد: {formatDate(exercise.due_date)}</span>
                          </span>
                          <span>{exercise.estimated_time}</span>
                          <span className="text-purple-600">{exercise.points} امتیاز</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getDifficultyBadge(exercise.difficulty)}
                          {getExerciseStatusBadge(exercise.submission_status)}
                          <span className="text-xs text-gray-500">{exercise.course_name}</span>
                        </div>
                      </div>
                      <Link to={`/exercises/${exercise.id}`}>
                        <Button size="sm" className="mr-4">
                          <Play className="h-4 w-4 ml-2" />
                          شروع
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Tasks */}
          <DailyTasksCard />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>دسترسی سریع</CardTitle>
            <CardDescription>به بخش‌های مختلف دسترسی پیدا کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/my-exercises">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>تمرین‌های من</span>
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                  <Award className="h-6 w-6" />
                  <span>پیشرفت تحصیلی</span>
                </Button>
              </Link>
              <Link to="/student-courses">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                  <Award className="h-6 w-6" />
                  <span>دوره‌های من</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2" disabled>
                <Calendar className="h-6 w-6" />
                <span>تقویم</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
