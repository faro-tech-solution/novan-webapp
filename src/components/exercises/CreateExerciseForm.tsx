import { useCallback, useEffect } from "react";
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

const formSchema = z.object({
  title: z.string().min(1, "عنوان تمرین الزامی است"),
  description: z.string().optional(),
  course_id: z.string().min(1, "انتخاب دوره الزامی است"),
  category_id: z.string().optional().or(z.literal("no-category")),
  difficulty: z.string().min(1, "انتخاب سطح دشواری الزامی است"),

  points: z.number().min(0, "امتیاز باید 0 یا بیشتر باشد"),
  estimated_time: z.string().min(1, "زمان تخمینی الزامی است"),
  exercise_type: z.enum(["form", "video", "audio", "simple", "iframe", "arvan_video"] as const),
  content_url: z
    .string()
    .url("آدرس محتوا باید URL معتبر باشد")
    .optional()
    .nullable(),
  auto_grade: z.boolean().default(false),
  form_structure: z
    .object({
      questions: z.array(z.any()),
    })
    .transform((val) => val as ExerciseForm),

  iframe_html: z.string().optional(),
  arvan_video_id: z.string().optional(),
});

export type CreateExerciseFormData = z.infer<typeof formSchema>;

interface CreateExerciseFormProps {
  courses: Course[];
  isSubmitting: boolean;
  onSubmit: (data: CreateExerciseFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: CreateExerciseFormData;
}

export const CreateExerciseForm = ({
  courses,
  isSubmitting,
  onSubmit,
  onCancel,
  defaultValues,
}: CreateExerciseFormProps) => {
  const form = useForm<CreateExerciseFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: defaultValues || {
      title: "",
      description: "",
      course_id: "",
      category_id: "no-category",
      difficulty: "",

      points: 100,
      estimated_time: "",
      exercise_type: "form",
      content_url: null,
      auto_grade: false,
      form_structure: { questions: [] },
      
      iframe_html: "",
      arvan_video_id: "",
    },
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      form.handleSubmit(onSubmit)(e);
      e.preventDefault();
      e.stopPropagation();
    },
    [form, onSubmit]
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
        <BasicInfoSection form={form} />
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
