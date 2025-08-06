import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormAnswer, ExerciseForm } from '@/types/formBuilder';
import { formatDate } from '@/lib/utils';

interface SubmissionViewerProps {
  form?: ExerciseForm | null;
  answers: FormAnswer[];
  submissionInfo?: {
    studentName: string;
    submittedAt: string;
    score?: number;
    feedback?: string;
  };
}

export const SubmissionViewer: React.FC<SubmissionViewerProps> = ({
  form,
  answers,
  submissionInfo
}) => {
  const getAnswer = (questionId: string): string | string[] => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer || '';
  };

  const formatAnswer = (answer: string | string[]): string => {
    if (Array.isArray(answer)) {
      return answer.join('، ');
    }
    return answer.toString();
  };

  return (
    <div className="space-y-4">
      {submissionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">اطلاعات ارسال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">نام دانشجو:</span>
              <span>{submissionInfo.studentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">تاریخ ارسال:</span>
              <span>{formatDate({dateString: submissionInfo.submittedAt})}</span>
            </div>
            {submissionInfo.score !== undefined && (
              <div className="flex justify-between items-center">
                <span className="font-medium">نمره:</span>
                <Badge variant={submissionInfo.score >= 80 ? "default" : submissionInfo.score >= 60 ? "secondary" : "destructive"}>
                  {submissionInfo.score}
                </Badge>
              </div>
            )}
            {submissionInfo.feedback && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">بازخورد:</span>
                <p className="text-blue-700 mt-1">{submissionInfo.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {form?.questions && form.questions.length > 0 ? (
        form.questions.map((question, index) => {
          const answer = getAnswer(question.id);
          const hasAnswer = Array.isArray(answer) ? answer.length > 0 : answer.toString().trim() !== '';

          return (
            <Card key={question.id} className={`${!hasAnswer && question.required ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <span className="ml-2">{index + 1}.</span>
                  {question.title}
                  {question.required && <span className="text-red-500 mr-1">*</span>}
                </CardTitle>
                {question.description && (
                  <p className="text-sm text-gray-600">{question.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="min-h-[40px] p-3 bg-gray-50 rounded-lg">
                  {hasAnswer ? (
                    <span className="text-gray-800">
                      {formatAnswer(answer)}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">
                      {question.required ? 'پاسخ داده نشده (اجباری)' : 'پاسخ داده نشده'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">هیچ سوالی برای نمایش وجود ندارد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
