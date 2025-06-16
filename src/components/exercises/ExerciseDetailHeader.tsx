
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Award } from 'lucide-react';

interface ExerciseDetailHeaderProps {
  onBack: () => void;
  difficulty: string;
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
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان':
        return <Badge className="bg-green-100 text-green-800">{difficulty}</Badge>;
      case 'متوسط':
        return <Badge className="bg-yellow-100 text-yellow-800">{difficulty}</Badge>;
      case 'سخت':
        return <Badge className="bg-red-100 text-red-800">{difficulty}</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">تکمیل شده</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">در انتظار بررسی</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">مهلت گذشته</Badge>;
      default:
        return <Badge variant="outline">شروع نشده</Badge>;
    }
  };

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
          {estimatedTime}
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
