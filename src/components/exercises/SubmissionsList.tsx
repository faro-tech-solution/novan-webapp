import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock } from 'lucide-react';
import { Submission } from '@/types/reviewSubmissions';
import { getExerciseTypeIconSmall } from '@/utils/exerciseTypeIcons';

interface SubmissionsListProps {
  submissions: Submission[];
  onViewSubmission: (submission: Submission) => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  onViewSubmission
}) => {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">هیچ پاسخی یافت نشد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {submission.exercise?.exercise_type && getExerciseTypeIconSmall(submission.exercise.exercise_type)}
                  {submission.exercise?.title || 'تمرین نامشخص'}
                </h3>
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{`${submission.student?.first_name} ${submission.student?.last_name}`}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submitted_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                {submission.score !== null ? (
                  <Badge variant={submission.score >= 80 ? "default" : submission.score >= 60 ? "secondary" : "destructive"}>
                    نمره: {submission.score}
                  </Badge>
                ) : (
                  <Badge variant="outline">بدون نمره</Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewSubmission(submission)}
                >
                  مشاهده
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
