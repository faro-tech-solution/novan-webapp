
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileText, Award, TrendingUp, Play } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const TraineeDashboard = () => {
  const { profile } = useAuth();
  
  // Mock data
  const stats = {
    completedExercises: 12,
    pendingExercises: 3,
    averageScore: 88,
    totalPoints: 1250
  };

  const assignedExercises = [
    { 
      id: 1, 
      title: 'مبانی React Hooks', 
      dueDate: '۱۳۹۶/۰۶/۱۶', 
      status: 'pending', 
      difficulty: 'متوسط',
      estimatedTime: '۲ ساعت'
    },
    { 
      id: 2, 
      title: 'طراحی CSS Grid', 
      dueDate: '۱۳۹۶/۰۶/۱۸', 
      status: 'pending', 
      difficulty: 'آسان',
      estimatedTime: '۱ ساعت'
    },
    { 
      id: 3, 
      title: 'JavaScript Promises', 
      dueDate: '۱۳۹۶/۰۶/۲۰', 
      status: 'not_started', 
      difficulty: 'سخت',
      estimatedTime: '۳ ساعت'
    },
  ];

  const recentScores = [
    { exercise: 'فرم‌های HTML', score: 95, date: '۱۳۹۶/۰۶/۱۰' },
    { exercise: 'انیمیشن‌های CSS', score: 82, date: '۱۳۹۶/۰۶/۰۸' },
    { exercise: 'دستکاری DOM', score: 90, date: '۱۳۹۶/۰۶/۰۵' },
  ];

  const dailyTasks = [
    { id: 1, task: 'تکمیل تمرین React Hooks', completed: false },
    { id: 2, task: 'مرور مفاهیم CSS Grid', completed: true },
    { id: 3, task: 'تمرین توابع JavaScript', completed: true },
    { id: 4, task: 'ارسال تکلیف فرم‌های HTML', completed: false },
  ];

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان': return 'bg-green-100 text-green-800';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800';
      case 'سخت': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout title="داشبورد دانشجو">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2 font-peyda">خوش آمدید، {profile?.name}!</h2>
          <p className="opacity-90">کلاس: {profile?.className}</p>
          <p className="opacity-90">شما {stats.pendingExercises} تمرین برای تکمیل دارید</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedExercises}</div>
              <p className="text-xs text-muted-foreground">تمرین تمام شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در انتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExercises}</div>
              <p className="text-xs text-muted-foreground">تمرین باقیمانده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">در همه تمرین‌ها</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مجموع امتیاز</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">امتیاز کسب شده</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>تمرین‌های تعیین شده</CardTitle>
              <CardDescription>تکالیف فعلی شما</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        {getStatusIcon(exercise.status)}
                        <h4 className="font-medium">{exercise.title}</h4>
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                        <span>موعد: {exercise.dueDate}</span>
                        <span>{exercise.estimatedTime}</span>
                      </div>
                      <Badge className={`mt-2 ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <Button size="sm" className="mr-4">
                      <Play className="h-4 w-4 ml-2" />
                      شروع
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Progress */}
          <Card>
            <CardHeader>
              <CardTitle>پیشرفت روزانه</CardTitle>
              <CardDescription>وظایف و دستاوردهای امروز</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>وظایف روزانه</span>
                    <span>{completedTasks}/{dailyTasks.length} تکمیل شده</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scores */}
        <Card>
          <CardHeader>
            <CardTitle>نمرات اخیر</CardTitle>
            <CardDescription>عملکرد تمرین‌های اخیر شما</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentScores.map((score, index) => (
                <div key={index} className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">{score.exercise}</h4>
                  <div className="text-2xl font-bold text-teal-600 mb-1">{score.score}%</div>
                  <p className="text-sm text-gray-600">{score.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
