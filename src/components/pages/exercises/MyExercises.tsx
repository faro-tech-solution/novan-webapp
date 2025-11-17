import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ExercisesView } from '@/components/exercises/ExercisesView';
import { useMyExercisesQuery } from '@/hooks/queries/useMyExercisesQuery';

const MyExercises = () => {
  const { courseId }: any = useParams();
  const { data: myExercises = [], isLoading, error } = useMyExercisesQuery(courseId);

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
