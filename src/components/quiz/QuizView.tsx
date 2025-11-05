'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  ClipboardList,
  Check,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { QuizQuestion, QuizAttempt, QuizResults } from '@/types/quiz';
import { GeneratedQuiz } from '@/services/quizGenerationService';
import { useGenerateQuiz, useSubmitQuiz, useRetakeQuiz } from '@/hooks/queries/useQuizAttemptsQuery';
import { fetchLatestCompletedQuizAttempt, fetchQuizResults } from '@/services/quizSubmissionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface QuizViewProps {
  exerciseId: string;
  quizType: 'chapter' | 'progress';
  onComplete?: (results: QuizResults) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  exerciseId,
  quizType,
  onComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const generateQuizMutation = useGenerateQuiz();
  const submitQuizMutation = useSubmitQuiz();
  const retakeQuizMutation = useRetakeQuiz();
  
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'a' | 'b' | 'c' | 'd'>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showRetake, setShowRetake] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // First, check if user has a completed attempt for this quiz
        const completedAttempt = await fetchLatestCompletedQuizAttempt(
          user.id,
          exerciseId,
          quizType
        );
        
        if (completedAttempt && completedAttempt.completed_at) {
          // Load the results for the completed attempt
          const quizResults = await fetchQuizResults(completedAttempt.id);
          setResults(quizResults);
          setShowRetake(true);
        } else {
          // No completed attempt, generate a new quiz
          const generated: GeneratedQuiz = await generateQuizMutation.mutateAsync({
            studentId: user.id,
            exerciseId,
            quizType,
          });
          setQuizAttempt(generated.attempt);
          setQuestions(generated.questions);
          setResults(null);
          setShowRetake(false);
        }
      } catch (error: any) {
        console.error('Error loading quiz:', error);
        toast({
          title: 'خطا در بارگذاری آزمون',
          description: error.message || 'خطایی در بارگذاری آزمون رخ داد. لطفاً دوباره تلاش کنید.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [exerciseId, quizType, user]);

  const handleAnswerSelect = (questionId: string, answer: 'a' | 'b' | 'c' | 'd') => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizAttempt) return;

    // Verify the attempt is not already completed
    if (quizAttempt.completed_at) {
      toast({
        title: 'این آزمون قبلاً تکمیل شده است',
        description: 'لطفاً برای شروع آزمون جدید از دکمه "آزمون مجدد" استفاده کنید',
        variant: 'destructive',
      });
      return;
    }

    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: 'لطفاً به همه سوالات پاسخ دهید',
        description: `هنوز ${unansweredQuestions.length} سوال بدون پاسخ باقی مانده است`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Submitting quiz with attempt ID:', quizAttempt.id);
      console.log('Attempt completed_at:', quizAttempt.completed_at);
      
      const submissionData = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: questionId,
        selected_answer: selectedAnswer,
      }));

      const results = await submitQuizMutation.mutateAsync({
        attemptId: quizAttempt.id,
        answers: submissionData,
      });

      console.log('Quiz submitted successfully. Results attempt ID:', results.attempt.id);
      
      setResults(results);
      setShowRetake(true);
      if (onComplete) {
        onComplete(results);
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'خطا در ارسال پاسخ‌ها',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading && !questions.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">در حال بارگذاری آزمون...</p>
        </div>
      </div>
    );
  }

  const handleRetakeQuiz = async () => {
    if (!user || !results?.attempt) return;
    
    const originalAttemptId = results.attempt.id;
    
    try {
      setIsLoading(true);
      // Retake the quiz - this creates a NEW attempt with a NEW ID
      const retakeData = await retakeQuizMutation.mutateAsync({
        attemptId: originalAttemptId,
        studentId: user.id,
      });
      
      // Verify we got a new attempt with a different ID
      if (retakeData.attempt.id === originalAttemptId) {
        throw new Error('Error: New attempt has same ID as original. Retake failed.');
      }
      
      console.log('Retake successful. Original attempt ID:', originalAttemptId);
      console.log('New attempt ID:', retakeData.attempt.id);
      
      // Retake returns { attempt, questions } with shuffled questions
      // IMPORTANT: Clear results and set the NEW attempt
      setResults(null);
      setQuizAttempt(retakeData.attempt); // This is the NEW attempt with a NEW ID
      setQuestions(retakeData.questions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowRetake(false);
      
      toast({
        title: 'آزمون مجدد شروع شد',
        description: 'آزمون با همان سوالات در ترتیب تصادفی در حال بارگذاری است',
      });
    } catch (error: any) {
      console.error('Error retaking quiz:', error);
      toast({
        title: 'خطا در شروع مجدد آزمون',
        description: error.message || 'خطایی در شروع مجدد آزمون رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewQuiz = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Generate a completely new quiz
      const generated: GeneratedQuiz = await generateQuizMutation.mutateAsync({
        studentId: user.id,
        exerciseId,
        quizType,
      });
      setQuizAttempt(generated.attempt);
      setQuestions(generated.questions);
      setResults(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowRetake(false);
    } catch (error: any) {
      console.error('Error starting new quiz:', error);
      toast({
        title: 'خطا در شروع آزمون جدید',
        description: error.message || 'خطایی در شروع آزمون جدید رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-blue-500" />
                نتیجه آزمون
              </CardTitle>
              {showRetake && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetakeQuiz}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    آزمون مجدد (همان سوالات)
                  </Button>
                  <Button
                    onClick={handleStartNewQuiz}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    شروع آزمون جدید
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-5xl font-bold mb-2">
                {results.percentage}%
              </div>
              <div className="flex items-center justify-center gap-2">
                {results.attempt.passed ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-green-600 font-semibold">قبول شدید!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    <span className="text-red-600 font-semibold">قبول نشدید</span>
                  </>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                امتیاز: {results.attempt.score} از {results.attempt.total_questions}
              </p>
            </div>

            {/* Questions and Answers Review */}
            <div className="space-y-4">
              {results.questions.map((question, index) => {
                const answer = results.answers.find(a => a.question_id === question.id);
                const isCorrect = answer?.is_correct;
                
                return (
                  <Card key={question.id} className={isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-3">
                            {index + 1}. {question.question_text}
                          </div>
                          <div className="space-y-2">
                            {[
                              { key: 'a', label: 'الف', option: question.option_a },
                              { key: 'b', label: 'ب', option: question.option_b },
                              { key: 'c', label: 'ج', option: question.option_c },
                              { key: 'd', label: 'د', option: question.option_d },
                            ].map(({ key, label, option }) => {
                              const isSelected = answer?.selected_answer === key;
                              const isCorrectAnswer = question.correct_answer === key;
                              
                              return (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg border ${
                                    isCorrectAnswer
                                      ? 'bg-green-100 border-green-300'
                                      : isSelected
                                      ? 'bg-red-100 border-red-300'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{label})</span>
                                    <span>{option}</span>
                                    {isCorrectAnswer && (
                                      <Check className="h-4 w-4 text-green-600 mr-auto" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">هیچ سوالی یافت نشد</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">پیشرفت</span>
              <span className="text-sm text-gray-600">
                {answeredCount} از {questions.length} پاسخ داده شده
              </span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-center gap-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    answers[q.id]
                      ? 'bg-green-500 text-white'
                      : idx === currentQuestionIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">سوال {currentQuestionIndex + 1}</span>
            <span className="text-gray-400">از {questions.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium mb-4">
            {currentQuestion.question_text}
          </div>

          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value as 'a' | 'b' | 'c' | 'd')}
          >
            {[
              { key: 'a', label: 'الف', option: currentQuestion.option_a },
              { key: 'b', label: 'ب', option: currentQuestion.option_b },
              { key: 'c', label: 'ج', option: currentQuestion.option_c },
              { key: 'd', label: 'د', option: currentQuestion.option_d },
            ].map(({ key, label, option }) => (
              <div
                key={key}
                className="flex flex-row-reverse direction-rtl items-center space-x-3 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <RadioGroupItem value={key} id={key} />
                <Label
                  htmlFor={key}
                  className="flex-1 cursor-pointer font-medium text-right"
                >
                  <span className="font-semibold text-blue-600 mx-2">{label})</span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              قبلی
            </Button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={isLoading || !answers[currentQuestion.id]}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'در حال ارسال...' : 'ارسال پاسخ‌ها'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
              >
                بعدی
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
