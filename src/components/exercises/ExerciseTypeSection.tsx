import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CreateExerciseFormData } from "./CreateExerciseForm";
import { FileText, Video, AudioLines, ListChecks } from "lucide-react";

interface ExerciseTypeSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const ExerciseTypeSection = ({ form }: ExerciseTypeSectionProps) => {
  const exerciseType = form.watch("exercise_type");

  return (
    <Card>
      <CardContent className="pt-6">
        <FormField
          control={form.control}
          name="exercise_type"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>نوع تمرین</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div className="flex items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="form" id="form" />
                    <Label
                      htmlFor="form"
                      className="flex items-center cursor-pointer"
                    >
                      <FileText className="h-5 w-5 ml-2" />
                      <div>
                        <div className="font-medium">فرم‌های متنوع</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="video" id="video" />
                    <Label
                      htmlFor="video"
                      className="flex items-center cursor-pointer"
                    >
                      <Video className="h-5 w-5 ml-2" />
                      <div>
                        <div className="font-medium">تمرین ویدیویی</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="audio" id="audio" />
                    <Label
                      htmlFor="audio"
                      className="flex items-center cursor-pointer"
                    >
                      <AudioLines className="h-5 w-5 ml-2" />
                      <div>
                        <div className="font-medium">تمرین صوتی</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label
                      htmlFor="simple"
                      className="flex items-center cursor-pointer"
                    >
                      <ListChecks className="h-5 w-5 ml-2" />
                      <div>
                        <div className="font-medium">تمرین ساده</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(exerciseType === "video" || exerciseType === "audio") && (
          <FormField
            control={form.control}
            name="content_url"
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>
                  آدرس {exerciseType === "video" ? "ویدیو" : "فایل صوتی"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      exerciseType === "video"
                        ? "https://example.com/video.mp4"
                        : "https://example.com/audio.mp3"
                    }
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="auto_grade"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-x-reverse mt-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>نمره‌دهی خودکار</FormLabel>
                <p className="text-sm text-muted-foreground">
                  دانشجو بلافاصله پس از تکمیل تمرین، نمره خود را دریافت می‌کند و
                  نیازی به بررسی مدرس نیست
                </p>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
