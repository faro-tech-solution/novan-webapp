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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CreateExerciseFormData } from "./CreateExerciseForm";
import { FileText, Video, AudioLines, ListChecks, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { FormBuilder } from "./FormBuilder";
import { useToast } from "@/hooks/use-toast";

interface ExerciseTypeSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
}

export const ExerciseTypeSection = ({ form }: ExerciseTypeSectionProps) => {
  const exerciseType = form.watch("exercise_type");
  const { toast } = useToast();

  const extractArvanVideoId = (input: string): string | null => {
    if (!input) return null;
    const trimmed = input.trim();
    const urlIdMatch = trimmed.match(/\/videos\/([^\/?#]+)(?:[\/?#]|$)/i);
    if (urlIdMatch && urlIdMatch[1]) return urlIdMatch[1];
    if (/^[A-Za-z0-9_-]{6,}$/i.test(trimmed)) return trimmed;
    return null;
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const extracted = extractArvanVideoId(text);
      if (extracted) {
        form.setValue("arvan_video_id", extracted, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        toast({ title: "شناسه ویدیو ثبت شد", description: extracted });
      } else {
        toast({ title: "شناسه معتبر پیدا نشد", description: "متن کلیپ‌بورد شامل شناسه یا لینک ویدیو آروان نبود" });
      }
    } catch (error) {
      toast({ title: "دسترسی به کلیپ‌بورد ناموفق بود", description: "اجازه دسترسی به کلیپ‌بورد را بررسی کنید" });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Right Column - Exercise Type Selection (3/12) */}
          <div className="col-span-12 lg:col-span-3 bg-gray">
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
                      className="space-y-3"
                    >
                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="form" id="form" />
                        <Label
                          htmlFor="form"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <FileText className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">فرم‌های متنوع</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="video" id="video" />
                        <Label
                          htmlFor="video"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <Video className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">تمرین ویدیویی</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="audio" id="audio" />
                        <Label
                          htmlFor="audio"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <AudioLines className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">تمرین صوتی</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="simple" id="simple" />
                        <Label
                          htmlFor="simple"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <ListChecks className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">تمرین ساده</div>
                          </div>
                        </Label>
                      </div>



                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="iframe" id="iframe" />
                        <Label
                          htmlFor="iframe"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <ExternalLink className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">iframe</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="arvan_video" id="arvan_video" />
                        <Label
                          htmlFor="arvan_video"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <Video className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">ویدیو آروان</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="negavid" id="negavid" />
                        <Label
                          htmlFor="negavid"
                          className="flex items-center cursor-pointer text-sm flex-row-reverse"
                        >
                          <Video className="h-4 w-4 ml-1" />
                          <div>
                            <div className="font-medium">ویدیو نگاود</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Left Column - Exercise Forms (9/12) */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <FormField
              control={form.control}
              name="auto_grade"
              render={({ field }) => {
                const isMediaType = exerciseType === 'video' || exerciseType === 'audio' || exerciseType === 'iframe' || exerciseType === 'arvan_video' || exerciseType === 'negavid';
                // Ensure default ON for media types
                if (isMediaType && !field.value) {
                  // Avoid re-render loops by setting only when false
                  setTimeout(() => {
                    form.setValue('auto_grade', true, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                  }, 0);
                }
                return (
                <FormItem className="flex flex-row items-start space-x-3 space-x-reverse bg-gray-100 p-4 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                    <FormLabel>نمره‌دهی خودکار</FormLabel><br />
                    <FormLabel className="text-sm text-muted-foreground">
                      دانشجو بلافاصله پس از تکمیل تمرین، نمره خود را دریافت می‌کند و
                      نیازی به بررسی مدرس نیست
                    </FormLabel>
                </FormItem>
              )}}
            />

            {(exerciseType === "video" || exerciseType === "audio") && (
              <FormField
                control={form.control}
                name="content_url"
                render={({ field }) => (
                  <FormItem>
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

            {exerciseType === "iframe" && (
              <FormField
                control={form.control}
                name="iframe_html"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد HTML iframe</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="کد HTML کامل iframe را اینجا وارد کنید..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      کد HTML کامل iframe شامل تگ‌های style و div را وارد کنید
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {exerciseType === "arvan_video" && (
              <FormField
                control={form.control}
                name="arvan_video_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شناسه ویدیو آروان *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="c8a3062d-006b-45f7-8639-c20c9eee27d5"
                          {...field}
                          value={field.value || ""}
                        />
                        <Button type="button" variant="secondary" onClick={handlePasteFromClipboard}>
                          چسباندن از کلیپ‌بورد
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      شناسه ویدیو در سرویس آروان کلود (Video ID). می‌توانید آدرس کامل ویدیو را از پنل آروان بچسبانید، شناسه به‌طور خودکار استخراج می‌شود.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {exerciseType === "negavid" && (
              <FormField
                control={form.control}
                name="negavid_video_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شناسه ویدیو نگاود *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="39620"
                          {...field}
                          value={field.value || ""}
                        />
                        <Button type="button" variant="secondary" onClick={handlePasteFromClipboard}>
                          چسباندن از کلیپ‌بورد
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      شناسه ویدیو در سرویس نگاود (Video ID). می‌توانید آدرس کامل ویدیو را از پنل نگاود بچسبانید، شناسه به‌طور خودکار استخراج می‌شود.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {exerciseType === "form" && (
              <div className="space-y-4">
                <FormBuilder
                  value={form.watch("form_structure")}
                  onChange={(formStructure) =>
                    form.setValue("form_structure", formStructure)
                  }
                />
              </div>
            )}
          </div>

          
        </div>
      </CardContent>
    </Card>
  );
};
