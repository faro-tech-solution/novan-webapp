
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Award, TrendingUp, Plus, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const TrainerDashboard = () => {
  // Mock data
  const stats = {
    totalStudents: 24,
    activeExercises: 8,
    pendingReviews: 12,
    averageScore: 85
  };

  const recentSubmissions = [
    { id: 1, student: 'جین دانشجو', exercise: 'مبانی HTML', submitted: '۲ ساعت پیش', score: null },
    { id: 2, student: 'باب یادگیرنده', exercise: 'CSS Flexbox', submitted: '۴ ساعت پیش', score: 92 },
    { id: 3, student: 'آلیس عجیب', exercise: 'توابع JavaScript', submitted: '۱ روز پیش', score: null },
  ];

  const topPerformers = [
    { name: 'سارا جانسون', score: 96, exercises: 15 },
    { name: 'مایک چن', score: 94, exercises: 12 },
    { name: 'اما دیویس', score: 92, exercises: 18 },
  ];

  return (
    <DashboardLayout title="داشبورد مربی">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مجموع دانشجویان</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">+۲ جدید این هفته</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تمرین‌های فعال</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeExercises}</div>
              <p className="text-xs text-muted-foreground">۳ ایجاد شده این هفته</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">بررسی‌های در انتظار</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">نیاز به توجه شما</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">+۲% از ماه گذشته</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>ارسال‌های اخیر</CardTitle>
              <CardDescription>آخرین ارسال‌های تمرین که نیاز به بررسی دارند</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{submission.student}</p>
                      <p className="text-sm text-gray-600">{submission.exercise}</p>
                      <p className="text-xs text-gray-500">{submission.submitted}</p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {submission.score ? (
                        <Badge variant="secondary">{submission.score}%</Badge>
                      ) : (
                        <Badge variant="outline">در انتظار</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>بهترین عملکردها</CardTitle>
              <CardDescription>دانشجویان با بالاترین میانگین نمرات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={student.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.exercises} تمرین تکمیل شده</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{student.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>اقدامات سریع</CardTitle>
            <CardDescription>وظایف رایج برای مدیریت برنامه آموزشی شما</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>ایجاد تمرین</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="h-6 w-6" />
                <span>مدیریت کلاس‌ها</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Award className="h-6 w-6" />
                <span>بررسی ارسال‌ها</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
