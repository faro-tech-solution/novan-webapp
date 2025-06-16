
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { fetchExerciseDetail, submitExerciseSolution, ExerciseDetail as ExerciseDetailType } from '@/services/exerciseDetailService';
import { useToast } from '@/hooks/use-toast';
import { FormAnswer } from '@/types/formBuilder';
import { ExerciseDetailHeader } from '@/components/exercises/ExerciseDetailHeader';
import { ExerciseInfoCard } from '@/components/exercises/ExerciseInfoCard';
import { TraineeExerciseForm } from '@/components/exercises/TraineeExerciseForm';
import { InstructorFormView } from '@/components/exercises/InstructorFormView';

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

  const handleSubmit = async () => {
    if (!exercise || !user) return;

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
        
        // Redirect to exercises list
        navigate('/my-exercises');
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
          <button onClick={() => navigate(-1)} className="mt-4">
            بازگشت
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="جزئیات تمرین">
      <div className="max-w-4xl mx-auto space-y-6">
        <ExerciseDetailHeader
          onBack={() => navigate(-1)}
          difficulty={exercise.difficulty}
          estimatedTime={exercise.estimated_time}
          points={exercise.points}
          submissionStatus={exercise.submission_status}
        />

        <ExerciseInfoCard
          title={exercise.title}
          courseName={exercise.course_name}
          openDate={exercise.open_date}
          dueDate={exercise.due_date}
          description={exercise.description}
        />

        {profile?.role === 'trainee' && (
          <TraineeExerciseForm
            exercise={exercise}
            answers={answers}
            onAnswersChange={setAnswers}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        {(profile?.role === 'trainer' || profile?.role === 'admin') && 
         exercise.form_structure && 
         exercise.form_structure.questions.length > 0 && (
          <InstructorFormView formStructure={exercise.form_structure} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
