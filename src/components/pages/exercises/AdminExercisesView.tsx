import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Exercise, MyExerciseWithSubmission } from "@/types/exercise";
import { ExercisesView } from "@/components/exercises/ExercisesView";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";
import { useAuth } from "@/contexts/AuthContext";

const AdminExercisesView = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { trainee: { courseId: activeCourseId } } = useDashboardPanelContext();

  const {
    exercises = [],
    loading: exercisesLoading,
    error: exercisesError,
    reorderExercises,
  } = useExercisesQuery(activeCourseId || undefined);

  const handleCreateExercise = () => {
    const createPath = profile?.role === "admin" 
      ? "/admin/exercises/create" 
      : "/trainer/exercises/create";
    router.push(createPath);
  };

  const handleExercisesReorder = (reorderedExercises: (Exercise | MyExerciseWithSubmission)[]) => {
    // The reordering is handled by the ExercisesView component
    // This callback can be used for additional actions if needed
    console.log('Exercises reordered:', reorderedExercises);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
              مدیریت تمرین‌ها
            </h2>
            <p className="text-gray-600">ایجاد و مدیریت تمرین‌های دانشجویان</p>
          </div>
          
          {/* Create Button */}
          <Button onClick={handleCreateExercise}>
            تمرین جدید
          </Button>
        </div>

        {/* Exercises View - Only Categorized */}
        <ExercisesView
          exercises={exercises}
          isLoading={exercisesLoading}
          error={exercisesError}
          userRole={profile?.role as 'admin' | 'trainer'}
          courseId={activeCourseId}
          onExercisesReorder={handleExercisesReorder}
          reorderExercises={reorderExercises}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminExercisesView; 