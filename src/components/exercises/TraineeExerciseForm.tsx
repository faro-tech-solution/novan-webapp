import { ExerciseHandler } from "./ExerciseHandler";
import { FormAnswer } from "@/types/formBuilder";
import { ExerciseType } from "@/types/exercise";

interface TraineeExerciseFormProps {
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
  return (
    <ExerciseHandler
      exercise={exercise}
      answers={answers}
      onAnswersChange={onAnswersChange}
      onSubmit={onSubmit}
      submitting={submitting}
      userId={userId}
      mode="trainee"
    />
  );
};
