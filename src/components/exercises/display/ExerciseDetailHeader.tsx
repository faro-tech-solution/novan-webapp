
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Award } from 'lucide-react';
import { getDifficultyBadge, getSubmissionStatusBadge } from './ExerciseStatusBadges';
import { formatEstimatedTime } from '@/utils/estimatedTimeUtils';

interface ExerciseDetailHeaderProps {
  onBack: () => void;
  difficulty: string | null;
  estimatedTime: string;
  points: number;
  submissionStatus: string;
}

export const ExerciseDetailHeader = ({
  onBack,
  difficulty,
  estimatedTime,
  points,
  submissionStatus
}: ExerciseDetailHeaderProps) => {
  // Format the estimated time using the utility
  const formattedTime = formatEstimatedTime(estimatedTime, 'time');

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        بازگشت
      </Button>
      <div className="flex items-center space-x-2 space-x-reverse">
        {getDifficultyBadge(difficulty)}
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          {formattedTime}
        </Badge>
        <Badge variant="outline">
          <Award className="h-3 w-3 mr-1" />
          {points} امتیاز
        </Badge>
        {getSubmissionStatusBadge(submissionStatus)}
      </div>
    </div>
  );
};
