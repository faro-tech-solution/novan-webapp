import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MyExerciseTable } from '@/components/exercises/MyExerciseTable';
import { useMyExercisesQuery } from '@/hooks/queries/useMyExercisesQuery';

const MyExercises = () => {
  const { data: myExercises = [], isLoading, error, refetch } = useMyExercisesQuery();

  // Filter out exercises that will start in the future
  const currentExercises = myExercises.filter(exercise => {
    const today = new Date();
    const openDate = new Date(exercise.open_date);
    return openDate <= today;
  });

  if (isLoading) {
    return (
      <DashboardLayout title="تمرین‌های من">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری تمرین‌ها...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="تمرین‌های من">
        <div className="text-center py-8">
          <p className="text-red-600">{error instanceof Error ? error.message : 'خطا در بارگذاری اطلاعات'}</p>
          <Button onClick={() => refetch()} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تمرین‌های من">
      <div className="space-y-6">
        {/* Exercises Table */}
        <MyExerciseTable 
          exercises={currentExercises}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyExercises;
