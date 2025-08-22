
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePreviewList } from '@/components/ui/FilePreviewList';
import { useAuth } from '@/contexts/AuthContext';
import { TraineeExerciseForm } from '../TraineeExerciseForm';
import { FormAnswer } from '@/types/formBuilder';
import { ExerciseDetail } from '@/types/exercise';
import { formatExerciseTitleWithNumber } from '@/utils/exerciseOrderUtils';

interface ExerciseInfoCardProps {
  title: string;
  courseName: string;
  description?: string | null;
  exercise: ExerciseDetail;
  answers: FormAnswer[];
  setAnswers: (answers: FormAnswer[]) => void;
  handleSubmit: () => void;
  submitMutation: any;
}

export const ExerciseInfoCard = ({
  title,
  courseName,
  description,
  exercise,
  answers,
  setAnswers,
  handleSubmit,
  submitMutation
}: ExerciseInfoCardProps) => {
  const { profile, user } = useAuth();

  // Format title with number if order_index is available
  const displayTitle = exercise.order_index 
    ? formatExerciseTitleWithNumber(title, exercise.order_index)
    : title;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{displayTitle}</CardTitle>
        <CardDescription className="text-base space-y-2">
          <div>درس: {courseName}</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">توضیحات تمرین:</h4>
            <div 
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {/* Exercise Attachments */}
        {exercise.attachments && exercise.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">فایل‌های پیوست:</h4>
            <FilePreviewList
              attachments={exercise.attachments}
              showRemoveButton={false}
              imageSize="lg"
            />
          </div>
        )}

        {profile?.role === "trainee" &&
          exercise.submission_status !== "completed" && 
          exercise.exercise_type !== "simple" && (
            <TraineeExerciseForm
              exercise={exercise}
              answers={answers}
              onAnswersChange={setAnswers}
              onSubmit={handleSubmit}
              submitting={submitMutation.isPending}
              userId={user?.id}
            />
          )}
      </CardContent>
    </Card>
  );
};
