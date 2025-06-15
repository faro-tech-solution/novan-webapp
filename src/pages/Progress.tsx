
import { useState, useEffect } from 'react';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          {/* Weekly Points Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 ml-2" />
                فعالیت هفتگی
              </CardTitle>
              <CardDescription>امتیازات کسب شده در هفته گذشته (بر اساس لاگ فعالیت)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.weeklyPointsActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} امتیاز`, 'امتیاز کسب شده']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="points" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
