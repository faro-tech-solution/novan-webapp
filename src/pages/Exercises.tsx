
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateExerciseDialog from '@/components/CreateExerciseDialog';
import { EditExerciseDialog } from '@/components/exercises/EditExerciseDialog';
import { useExercises, Exercise } from '@/hooks/useExercises';
import { useToast } from '@/hooks/use-toast';
import { ExerciseStatsCards } from '@/components/exercises/ExerciseStatsCards';
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters';
import { ExerciseTable } from '@/components/exercises/ExerciseTable';

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState('all');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  
  const { exercises, courses, loading, error, fetchExercises, deleteExercise } = useExercises();
  const { toast } = useToast();

  const handleDeleteExercise = async (id: string) => {
    if (window.confirm('آیا از حذف این تمرین مطمئن هستید؟')) {
      const { error } = await deleteExercise(id);
      if (error) {
        toast({
          title: "خطا",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "حذف شد",
          description: "تمرین با موفقیت حذف شد",
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
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    const matchesCourse = courseFilter === 'all' || exercise.course_name === courseFilter;
    const matchesExerciseStatus = exerciseStatusFilter === 'all' || exercise.exercise_status === exerciseStatusFilter;
    
    return matchesSearch && matchesDifficulty && matchesCourse && matchesExerciseStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">خطا: {error}</div>
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
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت تمرین‌ها</h2>
            <p className="text-gray-600">ایجاد و مدیریت تمرین‌های دانشجویان</p>
          </div>
          <CreateExerciseDialog onExerciseCreated={fetchExercises} />
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
          onExerciseUpdated={fetchExercises}
        />
      </div>
    </DashboardLayout>
  );
};

export default Exercises;
