
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TraineeExerciseForm } from './TraineeExerciseForm';
import { FormAnswer } from '@/types/formBuilder';
import { ExerciseDetail } from '@/types/exercise';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
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

        {profile?.role === "trainee" &&
          exercise.submission_status !== "completed" && (
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
