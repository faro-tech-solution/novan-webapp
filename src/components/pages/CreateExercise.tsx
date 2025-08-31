'use client';

import React from 'react';
import { CreateExerciseForm, CreateExerciseFormData } from '@/components/exercises';
import { useExercisesQuery } from '@/hooks/queries/useExercisesQuery';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';

interface CreateExerciseProps {
  exerciseId?: string;
}

export const CreateExercise: React.FC<CreateExerciseProps> = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useAuth();
  const { trainee: { courseId: activeCourseId } } = useDashboardPanelContext();
  const { createExercise, isCreating, courses } = useExercisesQuery();

  // Function to get the correct exercises page path based on user role and context
  const getExercisesPagePath = (categoryId: string | null) => {
    const categoryParam = categoryId && categoryId !== "no-category" ? `?category=${categoryId}` : "";
    
    if (profile?.role === 'admin') {
      return `/portal/admin/exercises${categoryParam}`;
    } else if (profile?.role === 'trainer') {
      return `/portal/trainer/exercises${categoryParam}`;
    } else if (profile?.role === 'trainee' && activeCourseId) {
      return `/portal/trainee/${activeCourseId}/exercises${categoryParam}`;
    } else {
      // Fallback to admin exercises page
      return `/portal/admin/exercises${categoryParam}`;
    }
  };

  const handleSubmit = async (data: CreateExerciseFormData) => {
    try {
      const exerciseData = {
        ...data,
        estimated_time: String(data.estimated_time ?? 0),
      };
      await createExercise(exerciseData);
      toast({
        title: "موفقیت",
        description: "تمرین با موفقیت ایجاد شد",
      });
      // Navigate to exercises page with category filter
      const exercisesPath = getExercisesPagePath(data.category_id || null);
      router.push(exercisesPath);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد تمرین",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ایجاد تمرین جدید</h1>
        <CreateExerciseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          courses={courses}
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
}; 