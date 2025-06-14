
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
import { useUser } from '@/contexts/UserContext';

const Progress = () => {
  const { user } = useUser();
  const [timeFilter, setTimeFilter] = useState('month');

  // Mock progress data
  const overallStats = {
    totalExercises: 15,
    completedExercises: 12,
    averageScore: 88,
    totalHours: 45,
    currentStreak: 7,
    rank: 3,
    totalStudents: 25
  };

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

  const achievements = [
    { id: 1, title: 'اولین تمرین', description: 'اولین تمرین خود را تکمیل کنید', earned: true, date: '۱۴۰۳/۰۶/۰۵' },
    { id: 2, title: 'دنباله ۷ روزه', description: '۷ روز متوالی تمرین کنید', earned: true, date: '۱۴۰۳/۰۶/۱۲' },
    { id: 3, title: 'استاد JavaScript', description: 'نمره بالای ۹۰ در تمرین‌های JS', earned: false, date: null },
    { id: 4, title: 'سریع‌تر از باد', description: 'تمرین را زیر زمان تخمینی تکمیل کنید', earned: true, date: '۱۴۰۳/۰۶/۱۰' },
  ];

  const completionRate = Math.round((overallStats.completedExercises / overallStats.totalExercises) * 100);

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
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+۱۲% از ماه قبل</span>
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
              <div className="text-2xl font-bold">{overallStats.averageScore}%</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+۵% از ماه قبل</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ساعات مطالعه</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalHours}</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">این ماه</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رتبه کلاسی</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{overallStats.rank}</div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <span className="text-gray-600">از {overallStats.totalStudents} نفر</span>
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
                  {overallStats.currentStreak}
                </div>
                <p className="text-gray-600">روز متوالی</p>
                <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-700">
                    عالی! شما {overallStats.currentStreak} روز متوالی مطالعه کرده‌اید
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
              دستاوردها
            </CardTitle>
            <CardDescription>جوایز و مدال‌های کسب شده</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    achievement.earned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    {achievement.earned ? (
                      <Award className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Award className="h-6 w-6 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-yellow-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                  {achievement.earned && achievement.date && (
                    <Badge variant="outline" className="text-xs">
                      {achievement.date}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Progress;
