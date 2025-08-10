'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { MyExerciseWithSubmission } from '@/types/exercise';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { Folder, FolderOpen, List, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CategorizedMyExercisesProps {
  exercises: MyExerciseWithSubmission[];
}

export const CategorizedMyExercises = ({ exercises }: CategorizedMyExercisesProps) => {
  const params = useParams();
  const courseId = params?.courseId as string;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all' | 'uncategorized'>('all');
  const { profile } = useAuth();
  const userRole = profile?.role;
  // Fetch categories for the course
  const { categories, loading: categoriesLoading } = useExerciseCategoriesQuery(courseId || '');

  // Group exercises by category
  const { categorizedExercises, uncategorizedExercises, allExercises } = useMemo(() => {
    const categorized: Record<string, MyExerciseWithSubmission[]> = {};
    const uncategorized: MyExerciseWithSubmission[] = [];
    
    exercises.forEach(exercise => {
      if (exercise.category_id) {
        if (!categorized[exercise.category_id]) {
          categorized[exercise.category_id] = [];
        }
        categorized[exercise.category_id].push(exercise);
      } else {
        uncategorized.push(exercise);
      }
    });

    return {
      categorizedExercises: categorized,
      uncategorizedExercises: uncategorized,
      allExercises: exercises
    };
  }, [exercises]);

  // Get exercises to display based on selected category
  const displayedExercises = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return allExercises;
    } else if (selectedCategoryId === 'uncategorized') {
      return uncategorizedExercises;
    } else {
      return categorizedExercises[selectedCategoryId] || [];
    }
  }, [selectedCategoryId, allExercises, uncategorizedExercises, categorizedExercises]);

  // Calculate stats for categories
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; pending: number; overdue: number }> = {};
    
    categories.forEach(category => {
      const categoryExercises = categorizedExercises[category.id] || [];
      stats[category.id] = {
        total: categoryExercises.length,
        completed: categoryExercises.filter(ex => ex.submission_status === 'completed').length,
        pending: categoryExercises.filter(ex => ex.submission_status === 'pending').length,
        overdue: categoryExercises.filter(ex => ex.submission_status === 'overdue').length,
      };
    });

    // Stats for uncategorized
    stats['uncategorized'] = {
      total: uncategorizedExercises.length,
      completed: uncategorizedExercises.filter(ex => ex.submission_status === 'completed').length,
      pending: uncategorizedExercises.filter(ex => ex.submission_status === 'pending').length,
      overdue: uncategorizedExercises.filter(ex => ex.submission_status === 'overdue').length,
    };

    // Stats for all
    stats['all'] = {
      total: allExercises.length,
      completed: allExercises.filter(ex => ex.submission_status === 'completed').length,
      pending: allExercises.filter(ex => ex.submission_status === 'pending').length,
      overdue: allExercises.filter(ex => ex.submission_status === 'overdue').length,
    };

    return stats;
  }, [categories, categorizedExercises, uncategorizedExercises, allExercises]);

  const getCategoryTitle = () => {
    if (selectedCategoryId === 'all') return userRole === 'trainee' ? "تمرین های پیش رو" : "همه تمرین‌ها";
    if (selectedCategoryId === 'uncategorized') return 'تمرین‌های بدون دسته‌بندی';
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : 'دسته‌بندی نامشخص';
  };

  const CategoryItem = ({ 
    title, 
    icon, 
    count, 
    isSelected, 
    onClick 
  }: { 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    count: number; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className={`w-full justify-start px-3 py-2 h-auto text-right ${
        isSelected ? 'bg-teal-100 text-teal-900 hover:bg-teal-200' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-end space-y-1">
          <Badge variant="secondary" className="text-xs px-2 py-0">
            {count}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{title}</span>
          {icon}
        </div>
      </div>
    </Button>
  );

  return (
    <div className="flex h-full space-x-4 space-x-reverse">
      {/* Categories Sidebar */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">دسته‌بندی تمرین‌ها</CardTitle>
          <CardDescription>
            انتخاب دسته‌بندی برای مشاهده تمرین‌ها
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {/* All Exercises */}
              <CategoryItem
                id="all"
                title={userRole === 'trainee' ? "تمرین های پیش رو" : "همه تمرین‌ها"}
                icon={<List className="h-4 w-4" />}
                count={allExercises.length}
                isSelected={selectedCategoryId === 'all'}
                onClick={() => setSelectedCategoryId('all')}
              />

              <Separator className="my-2" />

              {/* Categories from database */}
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    id={category.id}
                    title={category.name}
                    icon={
                      selectedCategoryId === category.id ? 
                        <FolderOpen className="h-4 w-4" /> : 
                        <Folder className="h-4 w-4" />
                    }
                    count={categoryStats[category.id]?.total || 0}
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  هیچ دسته‌بندی برای این دوره تعریف نشده است
                </div>
              )}

              {/* Uncategorized Exercises */}
              {uncategorizedExercises.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <CategoryItem
                    id="uncategorized"
                    title="بدون دسته‌بندی"
                    icon={<AlertCircle className="h-4 w-4" />}
                    count={uncategorizedExercises.length}
                    isSelected={selectedCategoryId === 'uncategorized'}
                    onClick={() => setSelectedCategoryId('uncategorized')}
                  />
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Exercises Display */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{getCategoryTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {displayedExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedCategoryId === 'all' 
                  ? 'هیچ تمرینی برای شما تعریف نشده است.'
                  : 'هیچ تمرینی در این دسته‌بندی وجود ندارد.'
                }
              </div>
            ) : (
              <div>
                {displayedExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};