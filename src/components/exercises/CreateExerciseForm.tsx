import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "./BasicInfoSection";
import { CourseAndDifficultySection } from "./CourseAndDifficultySection";
import { TimingAndPointsSection } from "./TimingAndPointsSection";
import { ExerciseTypeSection } from "./ExerciseTypeSection";
import { FormBuilder } from "./FormBuilder";
import { Course } from "@/types/course";
import { ExerciseForm } from "@/types/formBuilder";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "عنوان تمرین الزامی است"),
  description: z.string().optional(),
  course_id: z.string().min(1, "انتخاب دوره الزامی است"),
  category_id: z.string().optional(),
  difficulty: z.string().min(1, "انتخاب سطح دشواری الزامی است"),

  points: z.number().min(0, "امتیاز باید 0 یا بیشتر باشد"),
  estimated_time: z.string().min(1, "زمان تخمینی الزامی است"),
  exercise_type: z.enum(["form", "video", "audio", "simple", "spotplayer", "iframe"] as const),
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
  spotplayer_course_id: z.string().optional(),
  spotplayer_item_id: z.string().optional(),
  iframe_html: z.string().optional(),
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
      spotplayer_course_id: "",
      spotplayer_item_id: "",
      iframe_html: "",
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

        {/* Form Builder Section - Only show for form type exercises */}
        {form.watch("exercise_type") === "form" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">محتوای تمرین</h3>
            <FormBuilder
              value={form.watch("form_structure")}
              onChange={(formStructure) =>
                form.setValue("form_structure", formStructure)
              }
            />
          </div>
        )}

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
