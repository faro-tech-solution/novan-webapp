
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
  
  const { myExercises, loading, error, refetch } = useMyExercises();

  // Filter exercises based on search and filters
  const filteredExercises = myExercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || exercise.submission_status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
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
        <MyExerciseStatsCards exercises={myExercises} />

        {/* Filters */}
        <MyExerciseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
        />

        {/* Exercises Table */}
        <MyExerciseTable 
          exercises={myExercises}
          filteredExercises={filteredExercises}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyExercises;
