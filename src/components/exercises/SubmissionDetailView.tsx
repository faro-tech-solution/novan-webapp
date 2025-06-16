import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Clock, Award } from 'lucide-react';
import { SubmissionViewer } from './SubmissionViewer';
import { ExerciseForm, FormAnswer } from '@/types/formBuilder';

interface Submission {
  id: string;
  exercise_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  student_email: string;
  status: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  solution: string;
  exercise: {
    id: string;
    title: string;
    points: number;
    form_structure: ExerciseForm | null;
  };
}

interface SubmissionDetailViewProps {
  submission: Submission;
  onBack: () => void;
}

export const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({
  submission,
  onBack
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseFormStructure = (form_structure: any): ExerciseForm => {
    if (!form_structure) {
      return { questions: [] };
    }

    try {
      if (typeof form_structure === 'string') {
        return JSON.parse(form_structure) as ExerciseForm;
      } else if (typeof form_structure === 'object' && form_structure.questions) {
        return form_structure as ExerciseForm;
      }
      return { questions: [] };
    } catch (error) {
      console.error('Error parsing form_structure:', error);
      return { questions: [] };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{submission.exercise.title}</CardTitle>
              <div className="mt-2">
                <div className="flex items-center space-x-4 space-x-reverse text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{`${submission.first_name} ${submission.last_name}`}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submitted_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Award className="h-4 w-4" />
                    <span>{submission.exercise.points} امتیاز</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              بازگشت به لیست
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>پاسخ دانشجو</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionViewer
            form={parseFormStructure(submission.exercise.form_structure)}
            answers={JSON.parse(submission.solution) as FormAnswer[]}
            submissionInfo={{
              studentName: `${submission.first_name} ${submission.last_name}`,
              submittedAt: submission.submitted_at,
              score: submission.score || undefined,
              feedback: submission.feedback || undefined
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
