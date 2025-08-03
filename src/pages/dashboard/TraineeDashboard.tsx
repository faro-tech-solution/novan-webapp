import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMyExercises } from '@/hooks/useMyExercises';
// import { DailyTasksCard } from '@/components/dashboard/DailyTasksCard';
import { TraineeStatsCards } from '@/components/dashboard/TraineeStatsCards';
import { UpcomingExercisesCard } from '@/components/dashboard/UpcomingExercisesCard';
import WelcomeCard from '@/components/dashboard/WelcomeCard';

const TraineeDashboard = () => {
  const { myExercises, loading, error, refetch } = useMyExercises();

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
          <p className="text-red-600">{error instanceof Error ? error.message : String(error)}</p>
          <Button onClick={() => refetch()} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="داشبورد دانشجو">
      <div className="flex flex-row w-full p-2 md:p-4">
        <div className="w-full md:w-2/3">
          <WelcomeCard />
        </div>
        <div className="hidden md:block md:w-1/3 pr-4">
          <TraineeStatsCards exercises={currentExercises} gridMode />
        </div>
      </div>
      <div className="flex flex-row w-full p-2 md:p-4 mt-0">
        <div className="w-full md:w-1/3">
          {/* Upcoming Exercises */}
          <UpcomingExercisesCard exercises={upcomingExercises} />
        </div>

        {/* <div className="hidden md:block md:w-1/3 pr-4">
          <DailyTasksCard />
        </div> */}
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
