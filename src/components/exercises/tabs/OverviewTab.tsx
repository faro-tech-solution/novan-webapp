import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Award, Calendar, PlayCircle } from 'lucide-react';
import { getDifficultyBadge, getSubmissionStatusBadge } from '../display/ExerciseStatusBadges';
import { formatEstimatedTime } from '@/utils/estimatedTimeUtils';
import { formatDate } from '@/lib/utils';
import { ExerciseDetail } from '@/types/exercise';

interface OverviewTabProps {
  exercise: ExerciseDetail;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ exercise }) => {
  const formattedTime = formatEstimatedTime(exercise.estimated_time, 'time');
  const formattedUpdateDate = exercise.updated_at || exercise.created_at
    ? formatDate({ dateString: exercise.updated_at || exercise.created_at, format: 'jYYYY/jMM/jDD' })
    : '';

  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">سطح دشواری:</span>
              {getDifficultyBadge(exercise.difficulty)}
            </div>

            {/* Points */}
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">امتیاز:</span>
              <Badge variant="outline">{exercise.points} امتیاز</Badge>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">زمان تخمینی:</span>
              <Badge variant="outline">{formattedTime}</Badge>
            </div>

            {/* Last Update */}
            {formattedUpdateDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">آخرین به‌روزرسانی:</span>
              <span className="text-sm text-gray-600">{formattedUpdateDate}</span>
            </div>
            )}

            {/* Submission Status */}
            <div className="md:col-span-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">وضعیت:</span>
                {getSubmissionStatusBadge(exercise.submission_status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
