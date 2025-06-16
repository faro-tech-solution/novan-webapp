
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, User, Calendar, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubmissionViewer } from './SubmissionViewer';
import { ExerciseForm, FormAnswer } from '@/types/formBuilder';

interface SubmissionCardProps {
  submission: {
    id: string;
    student_name: string;
    student_email: string;
    submitted_at: string;
    score: number | null;
    feedback: string | null;
    solution: string;
    exercise: {
      title: string;
      form_structure: ExerciseForm | null;
    };
  };
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) {
      return <Badge variant="secondary">در انتظار نمره</Badge>;
    }
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800">عالی ({score}%)</Badge>;
    }
    if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">خوب ({score}%)</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">نیاز به بهبود ({score}%)</Badge>;
  };

  // Parse answers from solution
  let answers: FormAnswer[] = [];
  try {
    answers = JSON.parse(submission.solution);
  } catch (error) {
    console.error('Error parsing submission solution:', error);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{submission.exercise.title}</CardTitle>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
              <div className="flex items-center space-x-1 space-x-reverse">
                <User className="h-4 w-4" />
                <span>{submission.student_name}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(submission.submitted_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getScoreBadge(submission.score)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-1 space-x-reverse">
              <FileText className="h-4 w-4" />
              <span>{answers.length} پاسخ ارسال شده</span>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                مشاهده پاسخ‌ها
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>پاسخ‌های {submission.student_name}</DialogTitle>
              </DialogHeader>
              
              {submission.exercise.form_structure && (
                <SubmissionViewer
                  form={submission.exercise.form_structure}
                  answers={answers}
                  submissionInfo={{
                    studentName: submission.student_name,
                    submittedAt: submission.submitted_at,
                    score: submission.score || undefined,
                    feedback: submission.feedback || undefined,
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
