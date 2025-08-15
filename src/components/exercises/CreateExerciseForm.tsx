import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "./BasicInfoSection";
import { CourseAndDifficultySection } from "./CourseAndDifficultySection";
import { TimingAndPointsSection } from "./TimingAndPointsSection";
import { ExerciseTypeSection } from "./ExerciseTypeSection";
import { Course } from "@/types/course";
import { ExerciseForm } from "@/types/formBuilder";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadFileToSupabase } from "@/utils/uploadImageToSupabase";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "عنوان تمرین الزامی است"),
  description: z.string().optional(),
  course_id: z.string().min(1, "انتخاب دوره الزامی است"),
  category_id: z.string().optional().or(z.literal("no-category")),
  difficulty: z.string().optional().nullable(),

  points: z.number().min(1, "امتیاز باید بین 1 تا 250 باشد").max(250, "امتیاز باید بین 1 تا 250 باشد"),
  estimated_time: z.number().min(0, "زمان تخمینی باید بر حسب ثانیه و ۰ یا بیشتر باشد"),
  exercise_type: z.enum(["form", "video", "audio", "simple", "iframe", "arvan_video"] as const),
  content_url: z
    .string()
    .url("آدرس محتوا باید URL معتبر باشد")
    .optional()
    .nullable(),
  auto_grade: z.boolean().default(true),
  form_structure: z
    .object({
      questions: z.array(z.any()),
    })
    .transform((val) => val as ExerciseForm),

  iframe_html: z.string().optional(),
  arvan_video_id: z.string().optional(),
  attachments: z.array(z.string()).default([]), // Array of uploaded file URLs
});

export type CreateExerciseFormData = z.infer<typeof formSchema>;

interface CreateExerciseFormProps {
  courses: Course[];
  isSubmitting: boolean;
  onSubmit: (data: CreateExerciseFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: CreateExerciseFormData;
  selectedFiles?: File[];
  onSelectedFilesChange?: (files: File[]) => void;
}

export const CreateExerciseForm = ({
  courses,
  isSubmitting,
  onSubmit,
  onCancel,
  defaultValues,
  selectedFiles = [],
  onSelectedFilesChange,
}: CreateExerciseFormProps) => {
  const form = useForm<CreateExerciseFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: defaultValues || {
      title: "",
      description: "",
      course_id: "",
      category_id: "no-category",
      difficulty: undefined,

      points: 5,
      estimated_time: 0,
      exercise_type: "form",
      content_url: null,
      auto_grade: true,
      form_structure: { questions: [] },
      
      iframe_html: "",
      arvan_video_id: "",
      attachments: [],
    },
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Upload selected files first
        const uploadedUrls: string[] = [];
        const currentAttachments = form.getValues('attachments') || [];

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            const url = await uploadFileToSupabase(file, 'exercise-attachments');
            if (url) {
              uploadedUrls.push(url);
            } else {
              toast({
                title: "خطا در آپلود فایل",
                description: `فایل ${file.name} با موفقیت آپلود نشد`,
                variant: "destructive",
              });
            }
          }

          // Update form with new attachments
          const newAttachments = [...currentAttachments, ...uploadedUrls];
          form.setValue('attachments', newAttachments);
        }

        // Submit the form with updated data
        const formData = form.getValues();
        await onSubmit(formData);
      } catch (error) {
        console.error('Error in form submission:', error);
        toast({
          title: "خطا در ذخیره تمرین",
          description: "خطایی در ذخیره تمرین رخ داد",
          variant: "destructive",
        });
      }
    },
    [form, onSubmit, selectedFiles]
  );

  const handleCancel = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    },
    [onCancel]
  );

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <BasicInfoSection 
          form={form} 
          selectedFiles={selectedFiles}
          onSelectedFilesChange={onSelectedFilesChange}
        />
        <CourseAndDifficultySection form={form} courses={courses} />
        <TimingAndPointsSection form={form} />
        <ExerciseTypeSection form={form} />

        {/* Form Builder moved inside ExerciseTypeSection */}

        <div className="flex justify-end space-x-2 space-x-reverse pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "در حال ذخیره..."
              : defaultValues
              ? "ذخیره تغییرات"
              : "ایجاد تمرین"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
