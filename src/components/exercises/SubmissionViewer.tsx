import React, { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  exerciseInfo?: {
    title: string;
    description?: string | null;
    courseName?: string;
  };
}

export const SubmissionViewer = ({
  form,
  answers,
  submissionInfo,
  exerciseInfo
}: SubmissionViewerProps): ReactElement => {
  const getAnswer = (questionId: string): string | string[] => {
    const answer = answers.find((a: FormAnswer) => a.questionId === questionId);
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
      {exerciseInfo && (
        <Card>
          <CardContent className="space-y-2">
            {submissionInfo && (
              <div className="space-y-2 mt-3 flex flex-row justify-between">
                <div className="flex justify-between items-center">
                  <span className="font-medium ml-2">نام دانشجو:</span>
                  <span>{submissionInfo.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium ml-2">تاریخ ارسال:</span>
                  <span>{formatDate({dateString: submissionInfo.submittedAt || ''})}</span>
                </div>
              </div>
            )}
            {exerciseInfo.courseName && (
              <div className="flex justify-between items-center">
                <span className="font-medium">نام درس:</span>
                <span>{exerciseInfo.courseName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">عنوان تمرین:</span>
              <span>{exerciseInfo.title}</span>
            </div>
            {exerciseInfo.description && (
              <div className="mt-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-right">
                      <span className="font-medium text-gray-800">توضیحات تمرین</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div 
                        className="text-gray-700 p-3 bg-gray-50 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: exerciseInfo.description }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {form?.questions && form.questions.length > 0 ? (
        form.questions.map((question: any, index: number) => {
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
        null
      )}
    </div>
  );
};
