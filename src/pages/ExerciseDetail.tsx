
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Award, Send, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { fetchExerciseDetail, submitExerciseSolution, ExerciseDetail as ExerciseDetailType } from '@/services/exerciseDetailService';
import { useToast } from '@/hooks/use-toast';
import { FormRenderer } from '@/components/exercises/FormRenderer';
import { FormAnswer } from '@/types/formBuilder';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  const [exercise, setExercise] = useState<ExerciseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadExercise = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const exerciseData = await fetchExerciseDetail(id, user.id);
        
        if (!exerciseData) {
          setError('تمرین یافت نشد');
          return;
        }

        setExercise(exerciseData);
        
        // If there's already a submission, load the answers
        if (exerciseData.submission_answers) {
          setAnswers(exerciseData.submission_answers);
        }
      } catch (err) {
        console.error('Error loading exercise:', err);
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری تمرین');
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [id, user]);

  const validateRequiredQuestions = (): boolean => {
    if (!exercise?.form_structure?.questions) return true;

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

  const handleSubmit = async () => {
    if (!exercise || !user) return;

    if (!validateRequiredQuestions()) {
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await submitExerciseSolution(
        exercise.id,
        user.id,
        user.email || '',
        profile?.name || '',
        JSON.stringify(answers)
      );

      if (error) {
        toast({
          title: "خطا",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ارسال شد",
          description: "پاسخ شما با موفقیت ارسال شد",
        });
        
        // Reload exercise data to update submission status
        const updatedExercise = await fetchExerciseDetail(exercise.id, user.id);
        if (updatedExercise) {
          setExercise(updatedExercise);
        }
      }
    } catch (err) {
      console.error('Error submitting solution:', err);
      toast({
        title: "خطا",
        description: "خطا در ارسال پاسخ",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
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

  if (loading) {
    return (
      <DashboardLayout title="جزئیات تمرین">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !exercise) {
    return (
      <DashboardLayout title="جزئیات تمرین">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'تمرین یافت نشد'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            بازگشت
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isSubmitted = exercise.submission_status === 'completed' || exercise.submission_status === 'pending';
  const canSubmit = exercise.submission_status !== 'overdue' && new Date() >= new Date(exercise.open_date);

  return (
    <DashboardLayout title="جزئیات تمرین">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            بازگشت
          </Button>
          <div className="flex items-center space-x-2 space-x-reverse">
            {getDifficultyBadge(exercise.difficulty)}
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {exercise.estimated_time}
            </Badge>
            <Badge variant="outline">
              <Award className="h-3 w-3 mr-1" />
              {exercise.points} امتیاز
            </Badge>
            {getSubmissionStatusBadge(exercise.submission_status)}
          </div>
        </div>

        {/* Exercise Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exercise.title}</CardTitle>
            <CardDescription className="text-base space-y-2">
              <div>درس: {exercise.course_name}</div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>تاریخ شروع: {formatDate(exercise.open_date)}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>موعد تحویل: {formatDate(exercise.due_date)}</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exercise.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">توضیحات تمرین:</h4>
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {exercise.description}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Form */}
        {profile?.role === 'trainee' && (
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
                      onChange={setAnswers}
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
        )}

        {/* For instructors and admins - show form structure read-only */}
        {(profile?.role === 'trainer' || profile?.role === 'admin') && exercise.form_structure && exercise.form_structure.questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ساختار فرم تمرین</CardTitle>
              <CardDescription>
                نمایش سوالات تعریف شده برای این تمرین
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormRenderer
                form={exercise.form_structure}
                answers={[]}
                onChange={() => {}}
                disabled={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
