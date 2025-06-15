
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { MyExerciseStatsCards } from '@/components/exercises/MyExerciseStatsCards';
import { MyExerciseFilters } from '@/components/exercises/MyExerciseFilters';
import { MyExerciseTable } from '@/components/exercises/MyExerciseTable';
import { useMyExercises } from '@/hooks/useMyExercises';

const MyExercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  
  const { myExercises, loading, error, refetch } = useMyExercises();

  // Filter out exercises that will start in the future
  const currentExercises = myExercises.filter(exercise => {
    const today = new Date();
    const openDate = new Date(exercise.open_date);
    return openDate <= today;
  });

  // Get unique courses for the filter dropdown
  const availableCourses = Array.from(
    new Map(
      currentExercises
        .filter(exercise => exercise.course_name)
        .map(exercise => [exercise.course_id, { id: exercise.course_id, name: exercise.course_name! }])
    ).values()
  );

  // Filter exercises based on search and filters
  const filteredExercises = currentExercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || exercise.submission_status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    const matchesCourse = courseFilter === 'all' || exercise.course_id === courseFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesCourse;
  });

  if (loading) {
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
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تمرین‌های من">
      <div className="space-y-6">
        {/* Stats Cards */}
        <MyExerciseStatsCards exercises={currentExercises} />

        {/* Filters */}
        <MyExerciseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          availableCourses={availableCourses}
        />

        {/* Exercises Table */}
        <MyExerciseTable 
          exercises={currentExercises}
          filteredExercises={filteredExercises}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyExercises;
