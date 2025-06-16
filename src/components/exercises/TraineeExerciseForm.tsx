
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Clock } from 'lucide-react';
import { FormRenderer } from './FormRenderer';
import { ExerciseForm, FormAnswer } from '@/types/formBuilder';
import { useToast } from '@/hooks/use-toast';

interface TraineeExerciseFormProps {
  exercise: {
    id: string;
    title: string;
    form_structure?: ExerciseForm;
    submission_status: string;
    open_date: string;
    due_date: string;
    feedback?: string;
    score?: number;
  };
  answers: FormAnswer[];
  onAnswersChange: (answers: FormAnswer[]) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const TraineeExerciseForm = ({
  exercise,
  answers,
  onAnswersChange,
  onSubmit,
  submitting
}: TraineeExerciseFormProps) => {
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const validateRequiredQuestions = (): boolean => {
    if (!exercise.form_structure?.questions) return true;

    const requiredQuestions = exercise.form_structure.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = answers.find(a => a.questionId === q.id);
      if (!answer) return true;
      
      if (Array.isArray(answer.answer)) {
        return answer.answer.length === 0;
      }
      
      return !answer.answer || answer.answer.toString().trim() === '';
    });

    if (missingAnswers.length > 0) {
      toast({
        title: "خطا",
        description: `لطفاً به سوالات اجباری زیر پاسخ دهید: ${missingAnswers.map(q => q.title).join('، ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateRequiredQuestions()) {
      return;
    }
    onSubmit();
  };

  const isSubmitted = exercise.submission_status === 'completed' || exercise.submission_status === 'pending';
  const canSubmit = exercise.submission_status !== 'overdue' && new Date() >= new Date(exercise.open_date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>پاسخ به تمرین</CardTitle>
        <CardDescription>
          {isSubmitted 
            ? 'پاسخ شما قبلاً ارسال شده است. می‌توانید آن را ویرایش کنید.'
            : 'لطفاً به سوالات زیر پاسخ دهید'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canSubmit ? (
          <div className="space-y-6">
            {exercise.form_structure && exercise.form_structure.questions.length > 0 ? (
              <FormRenderer
                form={exercise.form_structure}
                answers={answers}
                onChange={onAnswersChange}
                disabled={false}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>این تمرین هنوز محتوایی ندارد</p>
              </div>
            )}
            
            {exercise.feedback && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">بازخورد استاد:</h5>
                <p className="text-blue-700">{exercise.feedback}</p>
                {exercise.score !== null && (
                  <p className="text-blue-800 font-semibold mt-2">نمره: {exercise.score}%</p>
                )}
              </div>
            )}
            
            {exercise.form_structure && exercise.form_structure.questions.length > 0 && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'در حال ارسال...' : (isSubmitted ? 'بروزرسانی پاسخ' : 'ارسال پاسخ')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {exercise.submission_status === 'overdue' ? 'مهلت تمرین به پایان رسیده' : 'تمرین هنوز شروع نشده'}
            </h3>
            <p className="text-gray-600">
              {exercise.submission_status === 'overdue' 
                ? 'متأسفانه مهلت ارسال این تمرین به پایان رسیده است.'
                : `این تمرین در تاریخ ${formatDate(exercise.open_date)} شروع خواهد شد.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
