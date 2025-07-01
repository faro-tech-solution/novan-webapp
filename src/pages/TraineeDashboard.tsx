
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMyExercises } from '@/hooks/useMyExercises';
import { useStudentAwards } from '@/hooks/useStudentAwards';
import { DailyTasksCard } from '@/components/dashboard/DailyTasksCard';
import { TraineeStatsCards } from '@/components/dashboard/TraineeStatsCards';
import { UpcomingExercisesCard } from '@/components/dashboard/UpcomingExercisesCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { AwardsSummaryCard } from '@/components/dashboard/AwardsSummaryCard';

const TraineeDashboard = () => {
  const { profile } = useAuth();
  const { myExercises, loading, error, refetch } = useMyExercises();
  const { studentAwards, loading: awardsLoading } = useStudentAwards();

  // Filter out exercises that will start in the future (same logic as MyExercises)
  const currentExercises = myExercises.filter(exercise => {
    const today = new Date();
    const openDate = new Date(exercise.open_date);
    return openDate <= today;
  });

  // Get upcoming exercises (not started, due soon) - limit to 3
  const upcomingExercises = currentExercises
    .filter(ex => ex.submission_status === 'not_started')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

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
        <TraineeStatsCards exercises={currentExercises} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Exercises */}
          <div className="lg:col-span-2">
            <UpcomingExercisesCard exercises={upcomingExercises} />
          </div>

          {/* Awards Summary */}
          <AwardsSummaryCard studentAwards={studentAwards} loading={awardsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Tasks */}
          <DailyTasksCard />

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
