import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Clock } from "lucide-react";
import { FormRenderer } from "./FormRenderer";
import { ExerciseForm, FormAnswer } from "@/types/formBuilder";
import { useToast } from "@/hooks/use-toast";
import { ExerciseType } from "@/types/exercise";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";
import { SimpleExerciseCompletion } from "./SimpleExerciseCompletion";
import { SpotPlayerVideo } from "./SpotPlayerVideo";
import { IframePlayer } from "./IframePlayer";
import { extractSpotPlayerData } from "@/utils/spotplayerExerciseUtils";
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
  userId,
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
  const canSubmit =
    exercise.submission_status !== "overdue";

  return (
    <Card>
      {" "}
      <CardHeader>
        {" "}
        <CardTitle>پاسخ به تمرین</CardTitle>{" "}
        <CardDescription>
          {" "}
          {isSubmitted
            ? "پاسخ شما قبلاً ارسال شده است. می‌توانید آن را ویرایش کنید."
            : "لطفاً به سوالات زیر پاسخ دهید"}{" "}
        </CardDescription>{" "}
      </CardHeader>{" "}
      <CardContent>
        {" "}
        {canSubmit ? (
          <div className="space-y-6">
            {" "}
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
            ) : exercise.exercise_type === "spotplayer" && 
               exercise.course_id && 
               userId ? (
              (() => {
                const spotplayerData = extractSpotPlayerData(exercise);
                if (!spotplayerData || !spotplayerData.spotplayer_course_id) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>این تمرین هنوز محتوایی ندارد</p>
                    </div>
                  );
                }
                return (
                  <SpotPlayerVideo
                    exerciseId={exercise.id}
                    courseId={exercise.course_id}
                    spotplayerCourseId={spotplayerData.spotplayer_course_id}
                    spotplayerItemId={spotplayerData.spotplayer_item_id}
                    userId={userId}
                    onComplete={handleMediaSubmit}
                    isCompleted={isSubmitted}
                    disabled={submitting || exercise.score !== undefined}
                  />
                );
              })()
            ) : (
              <div className="text-center py-8 text-gray-500">
                {" "}
                <p>این تمرین هنوز محتوایی ندارد</p>{" "}
              </div>
            )}{" "}
            {exercise.exercise_type === "form" &&
              exercise.form_structure &&
              exercise.form_structure.questions.length > 0 && (
                <div className="flex justify-end">
                  {" "}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || exercise.score !== undefined}
                  >
                    {" "}
                    <Send className="h-4 w-4 mr-2" />{" "}
                    {submitting
                      ? "در حال ارسال..."
                      : isSubmitted
                      ? "بروزرسانی پاسخ"
                      : "ارسال پاسخ"}{" "}
                  </Button>{" "}
                </div>
              )}{" "}
          </div>
        ) : (
          <div className="text-center py-8">
            {" "}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {" "}
              <Clock className="h-8 w-8 text-gray-600" />{" "}
            </div>{" "}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {" "}
              {exercise.submission_status === "overdue"
                ? "مهلت تمرین به پایان رسیده"
                : "تمرین هنوز شروع نشده"}{" "}
            </h3>{" "}
            <p className="text-gray-600">
              {" "}
              {exercise.submission_status === "overdue"
                ? "متأسفانه مهلت ارسال این تمرین به پایان رسیده است."
                : "این تمرین هنوز شروع نشده است."}{" "}
            </p>{" "}
          </div>
        )}{" "}
      </CardContent>{" "}
    </Card>
  );
};
