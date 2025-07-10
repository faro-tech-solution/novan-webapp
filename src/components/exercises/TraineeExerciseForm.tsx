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
interface TraineeExerciseFormProps {
  exercise: {
    id: string;
    title: string;
    exercise_type: ExerciseType;
    content_url?: string | null;
    auto_grade: boolean;
    form_structure?: ExerciseForm;
    submission_status: string;
    open_date: string;
    due_date: string;
    feedback?: string;
    score?: number;
    completion_percentage?: number;
    auto_graded?: boolean;
  };
  answers: FormAnswer[];
  onAnswersChange: (answers: FormAnswer[]) => void;
  onSubmit: (feedback?: string) => void;
  submitting: boolean;
}
export const TraineeExerciseForm = ({
  exercise,
  answers,
  onAnswersChange,
  onSubmit,
  submitting,
}: TraineeExerciseFormProps) => {
  const { toast } = useToast();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };
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
  const handleMediaSubmit = (feedback: string) => {
    onSubmit(feedback);
  };
  const isSubmitted =
    exercise.submission_status === "completed" ||
    exercise.submission_status === "pending";
  const canSubmit =
    exercise.submission_status !== "overdue" &&
    new Date() >= new Date(exercise.open_date);
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
            ) : exercise.exercise_type === "simple" ? (
              <SimpleExerciseCompletion
                onComplete={handleMediaSubmit}
                isCompleted={isSubmitted}
                disabled={submitting || exercise.score !== undefined}
              />
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
                : `این تمرین در تاریخ ${formatDate(
                    exercise.open_date
                  )} شروع خواهد شد.`}{" "}
            </p>{" "}
          </div>
        )}{" "}
      </CardContent>{" "}
    </Card>
  );
};
