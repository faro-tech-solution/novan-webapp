'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useCoursesQuery,
  useCreateExerciseMutation,
} from "@/hooks/useExercisesQuery";
import {
  CreateExerciseForm,
  CreateExerciseFormData,
} from "@/components/exercises/CreateExerciseForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import { fetchExerciseById } from "@/services/exerciseService";
import { useExercisesQuery as useExercisesQueryNew } from "@/hooks/queries/useExercisesQuery";

interface CreateExerciseProps {
  exerciseId?: string;
}

const CreateExercise = ({ exerciseId }: CreateExerciseProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: courses = [] } = useCoursesQuery();
  const createExerciseMutation = useCreateExerciseMutation();
  const { updateExercise } = useExercisesQueryNew();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch exercise data if in edit mode
  useEffect(() => {
    if (exerciseId) {
      setLoading(true);
      fetchExerciseById(exerciseId)
        .then((exerciseData) => {
          setExercise(exerciseData);
        })
        .catch((error) => {
          console.error("Error fetching exercise:", error);
          toast({
            title: "خطا",
            description: "خطا در بارگذاری اطلاعات تمرین",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [exerciseId, toast]);

  const onSubmit = useCallback(
    async (data: CreateExerciseFormData) => {
      try {
        const exerciseData = {
          title: data.title,
          description: data.description || null,
          course_id: data.course_id,
          category_id: data.category_id === "no-category" ? null : data.category_id,
          difficulty: data.difficulty,
          points: data.points,
          estimated_time: data.estimated_time || "-",
          exercise_type: data.exercise_type,
          content_url: data.content_url,
          iframe_html: data.iframe_html,
          auto_grade: data.auto_grade,
          form_structure: data.form_structure || { questions: [] },
          spotplayer_course_id: data.spotplayer_course_id,
          spotplayer_item_id: data.spotplayer_item_id,
        };

        if (exerciseId) {
          // Update existing exercise
          await updateExercise({ id: exerciseId, data: exerciseData });

          toast({
            title: "تمرین به‌روزرسانی شد",
            description: "تمرین با موفقیت به‌روزرسانی شد",
          });
        } else {
          // Create new exercise
          await createExerciseMutation.mutateAsync(exerciseData);

          toast({
            title: "تمرین ایجاد شد",
            description: "تمرین جدید با موفقیت ایجاد شد",
          });
        }

        // Navigate back to exercises page
        router.back();
      } catch (error) {
        console.error("Error saving exercise:", error);
        toast({
          title: "خطا",
          description:
            error instanceof Error ? error.message : "خطا در ذخیره تمرین",
          variant: "destructive",
        });
      }
    },
    [createExerciseMutation, router, toast, exerciseId, updateExercise]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Convert exercise data to form data format
  const getFormDefaultValues = useCallback(():
    | CreateExerciseFormData
    | undefined => {
    if (!exercise) return undefined;

    return {
      title: exercise.title,
      description: exercise.description || "",
      course_id: exercise.course_id || "",
      category_id: exercise.category_id || "no-category",
      difficulty: exercise.difficulty,
      points: exercise.points,
      estimated_time: exercise.estimated_time,
      exercise_type: exercise.exercise_type || "form",
      content_url: exercise.content_url || null,
      iframe_html: exercise.iframe_html || "",
      auto_grade: exercise.auto_grade || false,
      form_structure: (typeof exercise.form_structure === 'object' && exercise.form_structure !== null ? exercise.form_structure : { questions: [] }) as any,
      spotplayer_course_id: (exercise as any).spotplayer_course_id || "",
      spotplayer_item_id: (exercise as any).spotplayer_item_id || "",
    };
  }, [exercise]);

  if (loading) {
    return (
      <DashboardLayout title={exerciseId ? "ویرایش تمرین" : "ایجاد تمرین جدید"}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={exerciseId ? "ویرایش تمرین" : "ایجاد تمرین جدید"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 font-peyda">
              {exerciseId ? "ویرایش تمرین" : "ایجاد تمرین جدید"}
            </CardTitle>
            <CardDescription>
              {exerciseId ? "اطلاعات تمرین را ویرایش کنید" : "اطلاعات تمرین جدید را وارد کنید"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateExerciseForm
              courses={courses}
              isSubmitting={createExerciseMutation.isPending}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              defaultValues={getFormDefaultValues()}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateExercise;