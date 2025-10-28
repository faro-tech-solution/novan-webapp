import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseType } from "@/types/exercise";
import { FormAnswer } from "@/types/formBuilder";

// Import all player components
import { VideoPlayer } from "./players/VideoPlayer";
import { AudioPlayer } from "./players/AudioPlayer";
import { IframePlayer } from "./players/IframePlayer";
import { NegavidVideoPlayer } from "./players/NegavidVideoPlayer";

// Import form components
import { FormRenderer } from "./forms/FormRenderer";

// Import utility functions
import { extractNegavidVideoData } from "@/utils/negavidVideoExerciseUtils";

interface ExerciseHandlerProps {
  exercise: {
    id: string;
    title: string;
    exercise_type: ExerciseType;
    content_url?: string | null;
    iframe_html?: string | null;
    auto_grade: boolean;
    form_structure?: any;
    submission_status: string;
    feedback?: string;
    score?: number;
    course_id?: string;
    metadata?: any;
  };
  answers?: FormAnswer[];
  onAnswersChange?: (answers: FormAnswer[]) => void;
  onSubmit: (feedback?: string) => void;
  submitting: boolean;
  userId?: string;
  mode?: 'trainee' | 'instructor' | 'admin';
}

export const ExerciseHandler = ({
  exercise,
  answers = [],
  onAnswersChange = () => {},
  onSubmit,
  submitting,
  userId: _userId, // Prefix with underscore to indicate intentionally unused
  mode = 'trainee'
}: ExerciseHandlerProps) => {
  const { toast } = useToast();
  
  const isSubmitted =
    exercise.submission_status === "completed" ||
    exercise.submission_status === "pending";

  const validateRequiredQuestions = (): boolean => {
    if (!exercise.form_structure?.questions) return true;
    const requiredQuestions = exercise.form_structure.questions.filter(
      (q: any) => q.required
    );
    const missingAnswers = requiredQuestions.filter((q: any) => {
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
          .map((q: any) => q.title)
          .join("، ")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFormSubmit = () => {
    if (!validateRequiredQuestions()) {
      return;
    }
    onSubmit();
  };

  const handleMediaSubmit = (feedback?: string) => {
    onSubmit(feedback);
  };

  const renderFormExercise = () => {
    if (!exercise.form_structure || exercise.form_structure.questions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>این تمرین هنوز محتوایی ندارد</p>
        </div>
      );
    }

    return (
      <>
        <FormRenderer
          form={exercise.form_structure}
          answers={answers}
          onChange={onAnswersChange}
          disabled={mode !== 'trainee'}
        />
        {mode === 'trainee' && (
          <div className="flex justify-end">
            <Button
              onClick={handleFormSubmit}
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
      </>
    );
  };

  const renderMediaExercise = () => {
    const isDisabled = submitting || exercise.score !== undefined || mode !== 'trainee';

    switch (exercise.exercise_type) {
      case 'video':
        if (!exercise.content_url) {
          return (
            <div className="text-center py-8 text-gray-500">
              <p>این تمرین هنوز محتوایی ندارد</p>
            </div>
          );
        }
        return (
          <VideoPlayer
            videoUrl={exercise.content_url}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={isDisabled}
          />
        );

      case 'audio':
        if (!exercise.content_url) {
          return (
            <div className="text-center py-8 text-gray-500">
              <p>این تمرین هنوز محتوایی ندارد</p>
            </div>
          );
        }
        return (
          <AudioPlayer
            audioUrl={exercise.content_url}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={isDisabled}
          />
        );

      case 'iframe':
        if (!exercise.iframe_html) {
          return (
            <div className="text-center py-8 text-gray-500">
              <p>این تمرین هنوز محتوایی ندارد</p>
            </div>
          );
        }
        return (
          <IframePlayer
            iframeHtml={exercise.iframe_html}
            onComplete={handleMediaSubmit}
            isCompleted={isSubmitted}
            disabled={isDisabled}
          />
        );

      case 'negavid':
        const negavidVideoData = extractNegavidVideoData(exercise);
        if (!negavidVideoData || !negavidVideoData.negavid_video_id) {
          return (
            <div className="text-center py-8 text-gray-500">
              <p>این تمرین هنوز محتوایی ندارد</p>
              <p className="text-sm mt-2">شناسه ویدیو نگاود تعریف نشده است</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <NegavidVideoPlayer 
              videoId={negavidVideoData.negavid_video_id}
              className="w-full"
            />
            {mode === 'trainee' && !isSubmitted && (
              <div className="flex justify-center">
                <Button
                  onClick={() => handleMediaSubmit()}
                  disabled={isDisabled}
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

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>نوع تمرین پشتیبانی نمی‌شود</p>
          </div>
        );
    }
  };

  const renderExercise = () => {
    // Form-based exercises
    if (exercise.exercise_type === 'form') {
      return renderFormExercise();
    }
    
    // Media-based exercises
    return renderMediaExercise();
  };

  return (
    <div className="space-y-6">
      {renderExercise()}
    </div>
  );
};
