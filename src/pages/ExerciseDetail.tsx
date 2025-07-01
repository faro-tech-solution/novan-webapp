import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { FormAnswer } from '@/types/formBuilder';
import { ExerciseDetailHeader } from '@/components/exercises/ExerciseDetailHeader';
import { ExerciseInfoCard } from '@/components/exercises/ExerciseInfoCard';
import { TraineeExerciseForm } from '@/components/exercises/TraineeExerciseForm';
import { InstructorFormView } from '@/components/exercises/InstructorFormView';
import { useExerciseDetailQuery, useSubmitExerciseMutation } from '@/hooks/queries/useExerciseDetailQuery';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [answers, setAnswers] = useState<FormAnswer[]>([]);

  const { data: exercise, isLoading, error } = useExerciseDetailQuery(id!, user?.id);
  const submitMutation = useSubmitExerciseMutation();

  // Set initial answers if there's a submission
  React.useEffect(() => {
    if (exercise?.submission_answers) {
      setAnswers(exercise.submission_answers);
    }
  }, [exercise?.submission_answers]);

  const handleSubmit = async () => {
    if (!exercise || !user || !profile) return;

    submitMutation.mutate({
      exerciseId: exercise.id,
      studentId: user.id,
      studentEmail: user.email || '',
      studentName: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}` : '',
      answers,
    }, {
      onSuccess: () => {
        navigate('/my-exercises');
      }
    });
  };

  if (isLoading) {
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
          <p className="text-red-600">{error instanceof Error ? error.message : 'تمرین یافت نشد'}</p>
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
            submitting={submitMutation.isPending}
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
