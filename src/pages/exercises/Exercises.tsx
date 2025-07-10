import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CreateExerciseDialog from "@/components/dialogs/CreateExerciseDialog";
import { EditExerciseDialog } from "@/components/exercises/EditExerciseDialog";
import { Exercise } from "@/types/exercise";
import { useToast } from "@/hooks/use-toast";
import { ExerciseStatsCards } from "@/components/exercises/ExerciseStatsCards";
import { ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ExerciseTable } from "@/components/exercises/ExerciseTable";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState("all");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const { trainee: { courseId: activeCourseId } } = useDashboardPanelContext();

  const {
    exercises = [],
    loading: exercisesLoading,
    error: exercisesError,
    courses = [],
    deleteExercise: handleDeleteExerciseRequest,
  } = useExercisesQuery(activeCourseId || undefined);
  const { toast } = useToast();

  const handleDeleteExercise = async (id: string) => {
    if (window.confirm("آیا از حذف این تمرین مطمئن هستید؟")) {
      try {
        await handleDeleteExerciseRequest(id);
        toast({
          title: "حذف شد",
          description: "تمرین با موفقیت حذف شد",
        });
      } catch (error) {
        toast({
          title: "خطا",
          description:
            error instanceof Error ? error.message : "خطا در حذف تمرین",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const handleEditDialogClose = () => {
    setEditingExercise(null);
  };

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty =
      difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    const matchesCourse =
      courseFilter === "all" || exercise.course_name === courseFilter;
    const matchesExerciseStatus =
      exerciseStatusFilter === "all" ||
      exercise.exercise_status === exerciseStatusFilter;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesCourse &&
      matchesExerciseStatus
    );
  });

  if (!activeCourseId) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">لطفاً یک دوره فعال انتخاب کنید.</div>
        </div>
      </DashboardLayout>
    );
  }

  if (exercisesLoading) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (exercisesError) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">
            خطا:{" "}
            {exercisesError instanceof Error
              ? exercisesError.message
              : "خطای ناشناخته"}
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">
              مدیریت تمرین‌ها
            </h2>
            <p className="text-gray-600">ایجاد و مدیریت تمرین‌های دانشجویان</p>
          </div>
          <CreateExerciseDialog />
        </div>

        {/* Stats Cards */}
        <ExerciseStatsCards exercises={exercises} />

        {/* Filters */}
        <ExerciseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          exerciseStatusFilter={exerciseStatusFilter}
          setExerciseStatusFilter={setExerciseStatusFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          courses={courses}
        />

        {/* Exercises Table */}
        <ExerciseTable
          exercises={exercises}
          filteredExercises={filteredExercises}
          onDeleteExercise={handleDeleteExercise}
          onEditExercise={handleEditExercise}
        />

        {/* Edit Exercise Dialog */}
        <EditExerciseDialog
          exercise={editingExercise}
          open={!!editingExercise}
          onOpenChange={handleEditDialogClose}
        />
      </div>
    </DashboardLayout>
  );
};

export default Exercises;
