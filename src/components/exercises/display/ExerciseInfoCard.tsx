
import { Card, CardContent } from '@/components/ui/card';
import { FilePreviewList } from '@/components/ui/FilePreviewList';
import { useAuth } from '@/contexts/AuthContext';
import { TraineeExerciseForm } from '../TraineeExerciseForm';
import { FormAnswer } from '@/types/formBuilder';
import { ExerciseDetail } from '@/types/exercise';

interface ExerciseInfoCardProps {
  description?: string | null;
  exercise: ExerciseDetail;
  answers: FormAnswer[];
  setAnswers: (answers: FormAnswer[]) => void;
  handleSubmit: () => void;
  submitMutation: any;
}

export const ExerciseInfoCard = ({
  description,
  exercise,
  answers,
  setAnswers,
  handleSubmit,
  submitMutation
}: ExerciseInfoCardProps) => {
  const { profile, user } = useAuth();

  return (
    <Card>
      <CardContent>
        {description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
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
