'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { DraggableExerciseCard } from '@/components/exercises/DraggableExerciseCard';
import { MyExerciseWithSubmission, Exercise } from '@/types/exercise';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { useToast } from '@/hooks/use-toast';
import { Folder, FolderOpen, List, AlertCircle } from 'lucide-react';

interface ExercisesViewProps {
  exercises: (MyExerciseWithSubmission | Exercise)[];
  isLoading?: boolean;
  error?: Error | null;
  userRole?: 'trainee' | 'admin' | 'trainer';
  courseId?: string;
  onExercisesReorder?: (reorderedExercises: (MyExerciseWithSubmission | Exercise)[]) => void;
  reorderExercises?: (reorderData: { exerciseId: string; newOrderIndex: number; courseId: string; categoryId?: string | null }[]) => Promise<any>;
}

export const ExercisesView = ({
  exercises,
  isLoading = false,
  error = null,
  userRole = 'trainee',
  courseId: propCourseId,
  onExercisesReorder,
  reorderExercises
}: ExercisesViewProps) => {
  const params = useParams();
  const urlCourseId = params?.courseId as string;
  const courseId = propCourseId || urlCourseId;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all' | 'uncategorized'>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localExercises, setLocalExercises] = useState<(MyExerciseWithSubmission | Exercise)[]>(exercises);
  const { toast } = useToast();
  
  // Update localExercises when exercises prop changes
  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);
  
  // Fetch categories for the course (or all categories if no course is selected)
  const { categories, loading: categoriesLoading, error: categoriesError } = useExerciseCategoriesQuery(courseId || '');

  // Group exercises by category
  const { categorizedExercises, uncategorizedExercises, allExercises } = useMemo(() => {
    const categorized: Record<string, (MyExerciseWithSubmission | Exercise)[]> = {};
    const uncategorized: (MyExerciseWithSubmission | Exercise)[] = [];
    
    localExercises.forEach(exercise => {
      const categoryId = (exercise as any).category_id;
      if (categoryId) {
        if (!categorized[categoryId]) {
          categorized[categoryId] = [];
        }
        categorized[categoryId].push(exercise);
      } else {
        uncategorized.push(exercise);
      }
    });

    return {
      categorizedExercises: categorized,
      uncategorizedExercises: uncategorized,
      allExercises: localExercises
    };
  }, [localExercises]);

  // Get exercises to display based on selected category
  const displayedExercises = useMemo(() => {
    if (selectedCategoryId === 'all') {
      // For trainee role, show only uncompleted exercises (next 10)
      if (userRole === 'trainee') {
        const uncompletedExercises = allExercises.filter(ex => 
          (ex as any).submission_status !== 'completed'
        );
        return uncompletedExercises.slice(0, 10);
      }
      return allExercises;
    } else if (selectedCategoryId === 'uncategorized') {
      return uncategorizedExercises;
    } else {
      return categorizedExercises[selectedCategoryId] || [];
    }
  }, [selectedCategoryId, allExercises, uncategorizedExercises, categorizedExercises, userRole]);

  // Calculate stats for categories
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; pending: number }> = {};
    
    categories.forEach(category => {
      const categoryExercises = categorizedExercises[category.id] || [];
      stats[category.id] = {
        total: categoryExercises.length,
        completed: categoryExercises.filter(ex => (ex as any).submission_status === 'completed').length,
        pending: categoryExercises.filter(ex => (ex as any).submission_status === 'pending').length,
      };
    });

    // Stats for uncategorized
    stats['uncategorized'] = {
      total: uncategorizedExercises.length,
      completed: uncategorizedExercises.filter(ex => (ex as any).submission_status === 'completed').length,
      pending: uncategorizedExercises.filter(ex => (ex as any).submission_status === 'pending').length,
    };

    // Stats for all exercises
    stats['all'] = {
      total: allExercises.length,
      completed: allExercises.filter(ex => (ex as any).submission_status === 'completed').length,
      pending: allExercises.filter(ex => (ex as any).submission_status === 'pending').length,
    };

    return stats;
  }, [categories, categorizedExercises, uncategorizedExercises, allExercises]);

  // Update local exercises when props change
  useMemo(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  // Drag and drop handlers
  const handleDragStart = useCallback((_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    if (userRole !== 'admin' && userRole !== 'trainer') {
      setDraggedIndex(null);
      return;
    }

    try {
      // Get the exercises for the current category/view
      let exercisesToReorder: (MyExerciseWithSubmission | Exercise)[];
      
      if (selectedCategoryId === 'all') {
        // If "all" is selected, we need to handle this differently
        // For now, we'll only allow reordering within specific categories
        setDraggedIndex(null);
        toast({
          title: "خطا",
          description: "لطفاً برای تغییر ترتیب، یک دسته‌بندی خاص انتخاب کنید",
          variant: "destructive",
        });
        return;
      } else if (selectedCategoryId === 'uncategorized') {
        exercisesToReorder = uncategorizedExercises;
      } else {
        exercisesToReorder = categorizedExercises[selectedCategoryId] || [];
      }

      // Reorder exercises within the category
      const newCategoryExercises = [...exercisesToReorder];
      const draggedExercise = newCategoryExercises[draggedIndex];
      newCategoryExercises.splice(draggedIndex, 1);
      newCategoryExercises.splice(dropIndex, 0, draggedExercise);

      // Update the local exercises state
      let newLocalExercises: (MyExerciseWithSubmission | Exercise)[];
      
      if (selectedCategoryId === 'uncategorized') {
        // Update uncategorized exercises
        newLocalExercises = localExercises.map(exercise => {
          const categoryId = (exercise as any).category_id;
          if (!categoryId) {
            const uncatIndex = uncategorizedExercises.findIndex(e => e.id === exercise.id);
            if (uncatIndex !== -1) {
              return newCategoryExercises[uncatIndex] || exercise;
            }
          }
          return exercise;
        });
      } else {
        // Update categorized exercises
        newLocalExercises = localExercises.map(exercise => {
          const categoryId = (exercise as any).category_id;
          if (categoryId === selectedCategoryId) {
            const catIndex = categorizedExercises[selectedCategoryId]?.findIndex(e => e.id === exercise.id);
            if (catIndex !== -1) {
              return newCategoryExercises[catIndex] || exercise;
            }
          }
          return exercise;
        });
      }

      // Update local state immediately for better UX
      setLocalExercises(newLocalExercises);
      setDraggedIndex(null);

      // Prepare data for API call - only include exercises from the current category
      const reorderData = newCategoryExercises.map((exercise, index) => ({
        exerciseId: exercise.id,
        newOrderIndex: index,
        courseId: courseId || '',
        categoryId: selectedCategoryId === 'uncategorized' ? null : selectedCategoryId
      }));

      // Call API to update order in database
      await reorderExercises?.(reorderData);

      // Notify parent component
      if (onExercisesReorder) {
        onExercisesReorder(newLocalExercises);
      }

      toast({
        title: "ترتیب بروزرسانی شد",
        description: "ترتیب تمرین‌ها با موفقیت تغییر کرد",
      });
    } catch (error) {
      // Revert local changes on error
      setLocalExercises(exercises);
      toast({
        title: "خطا",
        description: "خطا در تغییر ترتیب تمرین‌ها",
        variant: "destructive",
      });
    }
  }, [draggedIndex, localExercises, userRole, courseId, onExercisesReorder, exercises, toast, reorderExercises, selectedCategoryId, uncategorizedExercises, categorizedExercises]);

  const getCategoryTitle = () => {
    if (selectedCategoryId === 'all') return "همه تمرین‌ها";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری تمرین‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error instanceof Error ? error.message : 'خطا در بارگذاری اطلاعات'}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          تلاش مجدد
        </Button>
      </div>
    );
  }

  // Categorized view
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
                title="همه تمرین‌ها"
                icon={<List className="h-4 w-4" />}
                count={categoryStats['all']?.total || 0}
                isSelected={selectedCategoryId === 'all'}
                onClick={() => setSelectedCategoryId('all')}
              />

              <Separator className="my-2" />

              {/* Categories from database */}
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : categoriesError ? (
                <div className="text-center py-4 text-red-500 text-sm">
                  خطا در بارگذاری دسته‌بندی‌ها: {categoriesError.message}
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    id={category.id}
                    title={
                      !courseId && (category as any).courses?.name 
                        ? `${category.name} (${(category as any).courses.name})`
                        : category.name
                    }
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
                  {userRole !== 'trainee' && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // TODO: Add category creation functionality
                          alert('برای ایجاد دسته‌بندی جدید، لطفاً از بخش مدیریت دسته‌بندی‌ها استفاده کنید.');
                        }}
                      >
                        ایجاد دسته‌بندی جدید
                      </Button>
                    </div>
                  )}
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
              <div className="space-y-4">
                {displayedExercises.map((exercise, index) => (
                  userRole === 'admin' || userRole === 'trainer' ? (
                    <DraggableExerciseCard
                      key={exercise.id}
                      exercise={exercise as Exercise}
                      index={index}
                      isDragging={draggedIndex === index}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      userRole={userRole}
                      exercises={allExercises}
                    />
                  ) : (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise as MyExerciseWithSubmission} 
                      userRole={userRole}
                      exercises={allExercises}
                    />
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 