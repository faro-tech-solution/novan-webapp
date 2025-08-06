import DashboardLayout from '@/components/layout/DashboardLayout';
import { ExercisesView } from '@/components/exercises/ExercisesView';
import { useMyExercisesQuery } from '@/hooks/queries/useMyExercisesQuery';

const MyExercises = () => {
  const { data: myExercises = [], isLoading, error } = useMyExercisesQuery();

  return (
    <DashboardLayout title="تمرین‌های من">
      <ExercisesView
        exercises={myExercises}
        isLoading={isLoading}
        error={error}
        userRole="trainee"
      />
    </DashboardLayout>
  );
};

export default MyExercises;
