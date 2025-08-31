'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import { MyExerciseWithSubmission, Exercise } from '@/types/exercise';
import { 
  calculateOverallExerciseStats, 
  calculateCategoryExerciseStats,
  formatDuration
} from '@/utils/exerciseStatsUtils';

interface ExerciseStatsReportProps {
  exercises: (MyExerciseWithSubmission | Exercise)[];
  title?: string;
  showCompletionPercentage?: boolean;
  variant?: 'overall' | 'category';
}

export const ExerciseStatsReport: React.FC<ExerciseStatsReportProps> = ({
  exercises,
  title = "گزارش کلی تمرین‌ها",
  showCompletionPercentage = true,
  variant = 'overall'
}) => {
  const stats = variant === 'overall' 
    ? calculateOverallExerciseStats(exercises)
    : calculateCategoryExerciseStats(exercises);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-2'>
        <div className="flex flex-wrap gap-3">
          {/* Total Exercises */}
          <div className="flex items-center p-2 gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <div className="text-sm text-gray-600">
                {stats.totalExercises}
              </div>
              <span className="text-sm text-gray-600">درس</span>
          </div>

          {/* Video Exercises */}
          <div className="flex items-center p-2 gap-2">
            <Video className="h-4 w-4 text-green-600" />
            {stats.totalVideoDuration > 0 && (
              <span className="text-sm text-gray-600">
                {formatDuration(stats.totalVideoDuration)} ویدیو آموزشی
              </span>
            )}
          </div>

          {/* Text Exercises */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <div className="text-sm text-gray-600">
                {stats.textExercises}
              </div>
              <span className="text-sm text-gray-600">تمرین‌</span>
            </div>
            
          </div>

          {/* Completion Percentage (only for overall stats) */}
          {showCompletionPercentage && variant === 'overall' && (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <div className="text-sm text-gray-600">
                  {stats.completionPercentage}%
                </div>
                <span className="text-sm text-gray-600">تکمیل شده</span>
              </div>
              
            </div>
          )}

          {/* For category stats, show completion percentage */}
          {variant === 'category' && (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <div className="text-sm text-gray-600">
                  {stats.completionPercentage}%
                </div>
                <span className="text-sm text-gray-600">تکمیل شده</span>
              </div>
              
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


