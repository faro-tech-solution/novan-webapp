import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { useToast } from "@/hooks/use-toast";
import { ExerciseStatsCards } from "@/components/exercises/ExerciseStatsCards";
import { ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ExerciseTable } from "@/components/exercises/ExerciseTable";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";
import { useAuth } from "@/contexts/AuthContext";

const Exercises = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState("all");

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
    const editPath = profile?.role === "admin" 
      ? `/admin/exercises/${exercise.id}` 
      : `/trainer/exercises/${exercise.id}`;
    router.push(editPath);
  };

  const handleCreateExercise = () => {
    const createPath = profile?.role === "admin" 
      ? "/admin/exercises/create" 
      : "/trainer/exercises/create";
    router.push(createPath);
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
            <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
              مدیریت تمرین‌ها
            </h2>
            <p className="text-gray-600">ایجاد و مدیریت تمرین‌های دانشجویان</p>
          </div>
          <Button onClick={handleCreateExercise}>
            <Plus className="h-4 w-4 ml-2" />
            تمرین جدید
          </Button>
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


      </div>
    </DashboardLayout>
  );
};

export default Exercises;
