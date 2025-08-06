import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { FormRenderer } from "./FormRenderer";
import { ExerciseForm, FormAnswer } from "@/types/formBuilder";
import { useToast } from "@/hooks/use-toast";
import { ExerciseType } from "@/types/exercise";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";
import { SimpleExerciseCompletion } from "./SimpleExerciseCompletion";
import { IframePlayer } from "./IframePlayer";
import { ArvanVideoPlayer } from "./ArvanVideoPlayer";
import { extractArvanVideoData } from "@/utils/arvanVideoExerciseUtils";
interface TraineeExerciseFormProps {
  exercise: {
    id: string;
    title: string;
    exercise_type: ExerciseType;
    content_url?: string | null;
    iframe_html?: string | null;
    auto_grade: boolean;
    form_structure?: ExerciseForm;
    submission_status: string;
    feedback?: string;
    score?: number;
    course_id?: string;
    metadata?: any;
  };
  answers: FormAnswer[];
  onAnswersChange: (answers: FormAnswer[]) => void;
  onSubmit: (feedback?: string) => void;
  submitting: boolean;
  userId?: string;
}
export const TraineeExerciseForm = ({
  exercise,
  answers,
  onAnswersChange,
  onSubmit,
  submitting,
}: TraineeExerciseFormProps) => {
  const { toast } = useToast();
  
  // Debug log for iframe exercises
  if (exercise.exercise_type === 'iframe') {
    console.log('Iframe exercise data:', {
      exercise_type: exercise.exercise_type,
      iframe_html: exercise.iframe_html,
      has_iframe_html: !!exercise.iframe_html,
      iframe_html_length: exercise.iframe_html?.length || 0
    });
  }
  
  const validateRequiredQuestions = (): boolean => {
    if (!exercise.form_structure?.questions) return true;
    const requiredQuestions = exercise.form_structure.questions.filter(
      (q) => q.required
    );
    const missingAnswers = requiredQuestions.filter((q) => {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) return true;
      if (Array.isArray(answer.answer)) {
        return answer.answer.length === 0;
      }
      return !answer.answer || answer.answer.toString().trim() === "";
    });
    if (missingAnswers.length > 0) {
      toast({
        title: "خطا",
        description: `لطفاً به سوالات اجباری زیر پاسخ دهید: ${missingAnswers
          .map((q) => q.title)
          .join("، ")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (!validateRequiredQuestions()) {
      return;
    }
    onSubmit();
  };
  const handleMediaSubmit = (feedback?: string) => {
    onSubmit(feedback);
  };
  const isSubmitted =
    exercise.submission_status === "completed" ||
    exercise.submission_status === "pending";

  return (
    <div>
      <div className="space-y-6">
        {exercise.exercise_type === "form" &&
        exercise.form_structure &&
        exercise.form_structure.questions.length > 0 ? (
          <FormRenderer
            form={exercise.form_structure}
            answers={answers}
            onChange={onAnswersChange}
            disabled={false}
          />
        ) : exercise.exercise_type === "video" && exercise.content_url ? (
          <VideoPlayer
            videoUrl={exercise.content_url}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={submitting || exercise.score !== undefined}
          />
        ) : exercise.exercise_type === "audio" && exercise.content_url ? (
          <AudioPlayer
            audioUrl={exercise.content_url}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={submitting || exercise.score !== undefined}
          />
        ) : exercise.exercise_type === "iframe" && exercise.iframe_html ? (
          <IframePlayer
            iframeHtml={exercise.iframe_html}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={submitting || exercise.score !== undefined}
          />
        ) : exercise.exercise_type === "simple" ? (
          <SimpleExerciseCompletion
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={submitting || exercise.score !== undefined}
          />
        ) : exercise.exercise_type === "arvan_video" ? (
          (() => {
            const arvanVideoData = extractArvanVideoData(exercise);
            if (!arvanVideoData || !arvanVideoData.arvan_video_id) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <p>این تمرین هنوز محتوایی ندارد</p>
                  <p className="text-sm mt-2">شناسه ویدیو آروان تعریف نشده است</p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <ArvanVideoPlayer 
                  videoId={arvanVideoData.arvan_video_id}
                  className="w-full"
                />
                {!isSubmitted && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => handleMediaSubmit()}
                    disabled={submitting || exercise.score !== undefined}
                    className="w-full max-w-md"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting
                      ? "در حال ارسال..."
                      : "تکمیل تمرین"}
                  </Button>
                </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>این تمرین هنوز محتوایی ندارد</p>
          </div>
        )}
        {exercise.exercise_type === "form" &&
          exercise.form_structure &&
          exercise.form_structure.questions.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting || exercise.score !== undefined}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting
                  ? "در حال ارسال..."
                  : isSubmitted
                  ? "بروزرسانی پاسخ"
                  : "ارسال پاسخ"}
              </Button>
            </div>
          )}
      </div>
    </div>
  );
};
