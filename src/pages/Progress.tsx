import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Calendar, 
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressStats } from '@/hooks/useProgressStats';
import { useStudentAwards } from '@/hooks/useStudentAwards';
import { AchievementsDisplay } from '@/components/awards/AchievementsDisplay';

const Progress = () => {
  const { profile } = useAuth();
  const { stats, loading, error } = useProgressStats();
  const { studentAwards, allAwards } = useStudentAwards();
  const [timeFilter, setTimeFilter] = useState('month');

  // Mock progress data for charts (would need historical data to make this real)
  const progressData = [
    { name: 'هفته ۱', score: 65, exercises: 2 },
    { name: 'هفته ۲', score: 78, exercises: 3 },
    { name: 'هفته ۳', score: 82, exercises: 2 },
    { name: 'هفته ۴', score: 88, exercises: 4 },
    { name: 'هفته ۵', score: 92, exercises: 3 },
    { name: 'هفته ۶', score: 85, exercises: 2 },
  ];

  const skillsData = [
    { name: 'HTML/CSS', value: 95, color: '#10B981' },
    { name: 'JavaScript', value: 82, color: '#F59E0B' },
    { name: 'React', value: 75, color: '#3B82F6' },
    { name: 'Node.js', value: 60, color: '#8B5CF6' },
  ];

  const weeklyActivity = [
    { day: 'شنبه', hours: 2 },
    { day: 'یکشنبه', hours: 3 },
    { day: 'دوشنبه', hours: 1 },
    { day: 'سه‌شنبه', hours: 4 },
    { day: 'چهارشنبه', hours: 2 },
    { day: 'پنج‌شنبه', hours: 3 },
    { day: 'جمعه', hours: 1 },
  ];

  // Convert student awards to achievements format for the old display
  const achievements = studentAwards.slice(0, 8).map(award => ({
    id: award.id,
    title: award.awards.name,
    description: award.awards.description,
    earned: true,
    date: new Date(award.earned_at).toLocaleDateString('fa-IR')
  }));

  if (loading) {
    return (
      <DashboardLayout title="پیشرفت تحصیلی">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری اطلاعات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="پیشرفت تحصیلی">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'خطا در بارگذاری اطلاعات'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const completionRate = stats.totalExercises > 0 
    ? Math.round((stats.completedExercises / stats.totalExercises) * 100)
    : 0;

  return (
    <DashboardLayout title="پیشرفت تحصیلی">
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">گزارش پیشرفت</h2>
            <p className="text-gray-600">تحلیل عملکرد و پیشرفت یادگیری شما</p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="بازه زمانی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">هفته اخیر</SelectItem>
              <SelectItem value="month">ماه اخیر</SelectItem>
              <SelectItem value="semester">ترم جاری</SelectItem>
              <SelectItem value="all">کل دوره</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نرخ تکمیل</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">{stats.completedExercises} از {stats.totalExercises}</span>
              </div>
              <ProgressBar value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">از {stats.completedExercises} تمرین</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مجموع امتیازات</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">شامل امتیاز جوایز</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رتبه کلاسی</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.rank}</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">از {stats.totalStudents} نفر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 ml-2" />
                روند پیشرفت
              </CardTitle>
              <CardDescription>نمرات شما در طول زمان</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#059669" 
                    strokeWidth={2}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 ml-2" />
                فعالیت هفتگی
              </CardTitle>
              <CardDescription>ساعات مطالعه در هفته</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 ml-2" />
                پیشرفت مهارت‌ها
              </CardTitle>
              <CardDescription>سطح مهارت شما در موضوعات مختلف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsData.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-600">{skill.value}%</span>
                    </div>
                    <ProgressBar value={skill.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 ml-2" />
                دنباله فعلی
              </CardTitle>
              <CardDescription>روزهای متوالی مطالعه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  {stats.currentStreak}
                </div>
                <p className="text-gray-600">روز متوالی</p>
                <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-700">
                    {stats.currentStreak > 0 
                      ? `عالی! شما ${stats.currentStreak} روز متوالی مطالعه کرده‌اید`
                      : 'شروع کنید و دنباله خود را بسازید!'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 ml-2" />
              دستاوردها ({studentAwards.length} از {allAwards.length})
            </CardTitle>
            <CardDescription>جوایز و مدال‌های موجود و کسب شده</CardDescription>
          </CardHeader>
          <CardContent>
            {allAwards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>در حال بارگذاری جوایز...</p>
              </div>
            ) : (
              <AchievementsDisplay 
                allAwards={allAwards} 
                studentAwards={studentAwards} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Progress;
