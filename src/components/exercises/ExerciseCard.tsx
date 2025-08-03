'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Award, 
  Star,
  TrendingUp,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { MyExerciseWithSubmission } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: MyExerciseWithSubmission;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const params = useParams();
  const courseId = params?.courseId as string;

  // Get background color based on status
  const getCardBackground = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-400';
      case 'pending':
        return 'bg-yellow-100 border-yellow-400';
      case 'overdue':
        return 'bg-red-100 border-red-400';
      case 'not_started':
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  // Get height styling based on status
  const getCardHeight = (status: string) => {
    if (status === 'pending' || status === 'completed') {
      return 'max-h-[40px] hover:max-h-none transition-all duration-300 ease-in-out cursor-pointer';
    }
    return '';
  };

  // Get status icon and styling
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4 text-gray-400" />,
          text: 'تکمیل شده',
          color: 'text-green-700'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 text-gray-400" />,
          text: 'در انتظار بررسی',
          color: 'text-yellow-700'
        };
      case 'overdue':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-gray-400" />,
          text: 'دیرکرد',
          color: 'text-red-700'
        };
      case 'not_started':
      default:
        return {
          icon: <FileText className="h-4 w-4 text-gray-400" />,
          text: 'انجام نشده',
          color: 'text-gray-700'
        };
    }
  };

  // Get difficulty icon and styling
  const getDifficultyDisplay = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان':
        return {
          icon: <Star className="h-4 w-4 text-gray-400" />,
          text: difficulty,
          color: 'text-gray-400'
        };
      case 'متوسط':
        return {
          icon: <TrendingUp className="h-4 w-4 text-gray-400" />,
          text: difficulty,
          color: 'text-gray-400'
        };
      case 'سخت':
        return {
          icon: <Zap className="h-4 w-4 text-gray-400" />,
          text: difficulty,
          color: 'text-gray-400'
        };
      default:
        return {
          icon: <Star className="h-4 w-4 text-gray-400" />,
          text: difficulty,
          color: 'text-gray-400'
        };
    }
  };

  const statusDisplay = getStatusDisplay(exercise.submission_status);
  const difficultyDisplay = getDifficultyDisplay(exercise.difficulty);

  return (
    <Link href={courseId ? `/trainee/${courseId}/exercise/${exercise.id}` : `/exercise/${exercise.id}`}>
      <Card className={`transition-all duration-200 mb-3 overflow-hidden hover:shadow-md transition-shadow border-0 border-r-4 ${getCardBackground(exercise.submission_status)} ${getCardHeight(exercise.submission_status)}`}>
        <CardHeader className="px-5 py-3">
          <h3 className="text-gray-900 leading-tight">
            {exercise.title}
          </h3>
        </CardHeader>
        
        <CardContent className='px-5 py-0'>
          {/* Main Info Row */}
          <div className="flex items-center space-x-4 space-x-reverse mb-3">
            {/* Difficulty */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {difficultyDisplay.icon}
              <span className={`text-sm text-gray-400`}>
                {difficultyDisplay.text}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {statusDisplay.icon}
              <span className={`text-sm text-gray-400`}>
                {statusDisplay.text}
              </span>
            </div>

            {/* Points */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Award className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {exercise.points} امتیاز
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};