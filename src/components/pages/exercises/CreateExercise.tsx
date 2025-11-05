'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useCoursesQuery } from "@/hooks/queries/useCoursesQuery";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";
import {
  CreateExerciseForm,
  CreateExerciseFormData,
} from "@/components/exercises";
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
  const { profile } = useAuth();
  const { trainee: { courseId: activeCourseId } } = useDashboardPanelContext();
  const { courses = [] } = useCoursesQuery();
  const { createExercise, isCreating } = useExercisesQuery();
  const { updateExercise, isUpdating } = useExercisesQueryNew();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Function to get the correct exercises page path based on user role and context
  const getExercisesPagePath = useCallback((categoryId: string | null) => {
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
  }, [profile?.role, activeCourseId]);

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
      console.log('CreateExercise onSubmit called with form data:', data);
      try {
        const exerciseData = {
          title: data.title,
          description: data.description || null,
          course_id: data.course_id,
          category_id: data.category_id === "no-category" ? null : data.category_id,
          difficulty: data.difficulty || null,
          points: data.points,
          estimated_time: String(data.estimated_time ?? 0),
          exercise_type: data.exercise_type,
          content_url: data.content_url,
          iframe_html: data.iframe_html,
          auto_grade: data.auto_grade,
          form_structure: data.form_structure || { questions: [] },
          attachments: data.attachments || [],
          negavid_video_id: data.negavid_video_id,
          is_exercise: data.is_exercise !== undefined ? data.is_exercise : false,
          transcription: data.transcription || null,
          is_disabled: data.is_disabled !== undefined ? data.is_disabled : false,
        };
        
        console.log('Transformed exerciseData:', exerciseData);

        if (exerciseId) {
          // Update existing exercise
          await updateExercise({ id: exerciseId, data: exerciseData });

          toast({
            title: "تمرین به‌روزرسانی شد",
            description: "تمرین با موفقیت به‌روزرسانی شد",
          });
        } else {
          // Create new exercise
          await createExercise(exerciseData);

          toast({
            title: "تمرین ایجاد شد",
            description: "تمرین جدید با موفقیت ایجاد شد",
          });
        }

        // Navigate to exercises page with category filter
        const exercisesPath = getExercisesPagePath(data.category_id || null);
        router.push(exercisesPath);
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
    [createExercise, router, toast, exerciseId, updateExercise, getExercisesPagePath]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectedFilesChange = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

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
      difficulty: exercise.difficulty || undefined,
      points: exercise.points,
      estimated_time: Number(exercise.estimated_time || 0),
      exercise_type: exercise.exercise_type || "form",
      content_url: exercise.content_url || null,
      iframe_html: exercise.iframe_html || "",
      auto_grade: exercise.auto_grade || false,
      form_structure: (typeof exercise.form_structure === 'object' && exercise.form_structure !== null ? exercise.form_structure : { questions: [] }) as any,
      attachments: exercise.attachments || [],
      negavid_video_id: (exercise as any).negavid_video_id || "",
      is_exercise: exercise.is_exercise !== undefined ? exercise.is_exercise : false,
      transcription: exercise.transcription || null,
      is_disabled: exercise.is_disabled !== undefined ? exercise.is_disabled : false,
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
            <CardTitle className="text-2xl font-bold text-gray-900 font-yekanbakh">
              {exerciseId ? "ویرایش تمرین" : "ایجاد تمرین جدید"}
            </CardTitle>
            <CardDescription>
              {exerciseId ? "اطلاعات تمرین را ویرایش کنید" : "اطلاعات تمرین جدید را وارد کنید"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateExerciseForm
              courses={courses}
              isSubmitting={isCreating || isUpdating}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              defaultValues={getFormDefaultValues()}
              selectedFiles={selectedFiles}
              onSelectedFilesChange={handleSelectedFilesChange}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateExercise;