'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, ChevronDown, ChevronRight, BookOpen, X, Menu } from 'lucide-react';
import { Exercise } from '@/types/exercise';
import { useExercisesQuery } from '@/hooks/queries/useExercisesQuery';

// Type for exercises with submission information
type ExerciseWithSubmission = Exercise & {
  submission_status?: 'not_started' | 'pending' | 'completed';
  score?: number | null;
};

interface ExerciseListSidebarProps {
  currentExerciseId: string;
  courseId: string;
}

const ExerciseListSidebar: React.FC<ExerciseListSidebarProps> = ({
  currentExerciseId,
  courseId,
}) => {
  const router = useRouter();
  // RLS policies automatically filter out disabled exercises for trainees
  const { exercises = [], loading } = useExercisesQuery(courseId);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleExerciseClick = (exerciseId: string) => {
    router.push(`/portal/trainee/${courseId}/exercise/${exerciseId}`);
    setIsMobileOpen(false); // Close mobile sidebar after navigation
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Group exercises by category and calculate cumulative numbering
  const groupedExercises = React.useMemo(() => {
    const groups: { [key: string]: { category: string; exercises: ExerciseWithSubmission[] } } = {};
    
    exercises.forEach((exercise) => {
      const exerciseWithSubmission = exercise as ExerciseWithSubmission;
      const categoryId = exercise.category_id || 'no-category';
      const categoryName = exercise.category_name || 'بدون دسته‌بندی';
      
      if (!groups[categoryId]) {
        groups[categoryId] = {
          category: categoryName,
          exercises: []
        };
      }
      groups[categoryId].exercises.push(exerciseWithSubmission);
    });

    // Calculate cumulative exercise numbers across all categories
    let cumulativeIndex = 0;
    Object.values(groups).forEach(group => {
      group.exercises.forEach((exercise, index) => {
        (exercise as any).cumulativeIndex = cumulativeIndex + index + 1;
      });
      cumulativeIndex += group.exercises.length;
    });

    return groups;
  }, [exercises]);

  // Expand the category containing the current exercise by default
  React.useEffect(() => {
    if (currentExerciseId && exercises.length > 0) {
      const currentExercise = exercises.find(ex => ex.id === currentExerciseId);
      if (currentExercise && currentExercise.category_id) {
        setExpandedCategories(new Set([currentExercise.category_id]));
      }
    }
  }, [currentExerciseId, exercises]);

  const getStatusIcon = (exercise: ExerciseWithSubmission) => {
    if (exercise.submission_status === 'completed' || exercise.submission_status === 'pending') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    // Not started exercises should show green circle
    return <Circle className="h-4 w-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-20 right-4 z-50 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-80 bg-white border-l border-gray-200 p-4 h-full overflow-y-auto ${
        isMobileOpen ? 'fixed right-0 top-0 z-50 lg:relative lg:z-auto' : 'hidden lg:block'
      }`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 ml-2" />
              لیست تمرین‌ها
            </h3>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {exercises.length} تمرین در این دوره
          </p>
        </div>

      <div className="space-y-2">
        {Object.entries(groupedExercises).map(([categoryId, group]) => {
          const isExpanded = expandedCategories.has(categoryId);
          return (
            <div key={categoryId} className="border border-gray-200 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                    <span className="ml-3">{group.category}</span>
                    <span className="text-xs text-gray-500">({group.exercises.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {/* Exercises List */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {group.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`px-3 py-2 flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-gray-50 transition-colors ${
                        exercise.id === currentExerciseId ? 'bg-teal-50 border-r-2 border-teal-500' : ''
                      }`}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      {/* Exercise Number Circle */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(exercise)}
                      </div>
                      
                      {/* Exercise Number and Title */}
                      <div className="flex-1 min-w-0 flex items-center space-x-2 space-x-reverse">
                        <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                          {String((exercise as any).cumulativeIndex).padStart(2, '0')}.
                        </span>
                        <p className="text-sm text-gray-900 truncate">
                          {exercise.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">هیچ تمرینی در این دوره وجود ندارد</p>
        </div>
      )}
      </div>
    </>
  );
};

export default ExerciseListSidebar;
