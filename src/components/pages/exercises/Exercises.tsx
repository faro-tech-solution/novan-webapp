import DashboardLayout from "@/components/layout/DashboardLayout";
import { ExercisesView } from "@/components/exercises/ExercisesView";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";
import { useAuth } from "@/contexts/AuthContext";

const Exercises = () => {
  const { profile } = useAuth();
  const { trainee: { courseId: activeCourseId } } = useDashboardPanelContext();

  const {
    exercises = [],
    loading: exercisesLoading,
    error: exercisesError,
    deleteExercise,
  } = useExercisesQuery(activeCourseId || undefined);

  const handleDeleteExercise = async (exerciseId: string): Promise<void> => {
    const result = await deleteExercise(exerciseId);
    if (result.error) {
      throw new Error(result.error);
    }
  };

  if (!activeCourseId) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">لطفاً یک دوره فعال انتخاب کنید.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت تمرین‌ها">
      <ExercisesView
        exercises={exercises}
        isLoading={exercisesLoading}
        error={exercisesError}
        userRole={profile?.role as 'admin' | 'trainer'}
        courseId={activeCourseId}
        onDeleteExercise={handleDeleteExercise}
      />
    </DashboardLayout>
  );
};

export default Exercises;
