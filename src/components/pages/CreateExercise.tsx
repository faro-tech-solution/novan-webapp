'use client';

import React from 'react';
import { CreateExerciseForm, CreateExerciseFormData } from '@/components/exercises/CreateExerciseForm';
import { useExercisesQuery } from '@/hooks/queries/useExercisesQuery';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CreateExerciseProps {
  exerciseId?: string;
}

export const CreateExercise: React.FC<CreateExerciseProps> = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { createExercise, isCreating, courses } = useExercisesQuery();

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
      router.push('/portal/admin/exercises');
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