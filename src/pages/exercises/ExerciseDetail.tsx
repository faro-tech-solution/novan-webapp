import React, { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { FormAnswer } from "@/types/formBuilder";
import { ExerciseDetailHeader } from "@/components/exercises/ExerciseDetailHeader";
import { ExerciseInfoCard } from "@/components/exercises/ExerciseInfoCard";
import { TraineeExerciseForm } from "@/components/exercises/TraineeExerciseForm";
import { TraineeFeedbackDisplay } from "@/components/exercises/TraineeFeedbackDisplay";
import { InstructorFormView } from "@/components/exercises/InstructorFormView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useExerciseDetailQuery,
  useSubmitExerciseMutation,
} from "@/hooks/queries/useExerciseDetailQuery";

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [answers, setAnswers] = useState<FormAnswer[]>([]);

  const {
    data: exercise,
    isLoading,
    error,
  } = useExerciseDetailQuery(id!, user?.id);
  const submitMutation = useSubmitExerciseMutation();

  // Set initial answers if there's a submission
  React.useEffect(() => {
    if (exercise?.submission_answers) {
      setAnswers(exercise.submission_answers);
    }
  }, [exercise?.submission_answers]);

  const handleSubmit = async (feedback?: string) => {
    if (!exercise || !user || !profile) return;

    submitMutation.mutate(
      {
        exerciseId: exercise.id,
        studentId: user.id,
        studentEmail: user.email || "",
        studentName: profile.first_name
          ? `${profile.first_name} ${profile.last_name || ""}`
          : "",
        answers,
        feedback: feedback || "", // Include feedback in submission
      },
      {
        onSuccess: () => {
          navigate("/my-exercises");
        },
      }
    );
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
          <p className="text-red-600">
            {error instanceof Error ? error.message : "تمرین یافت نشد"}
          </p>
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

        {/* Submission Status Notification for Trainees */}
        {profile?.role === "trainee" &&
          exercise.submission_status === "completed" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تمرین قبلا ارسال شده است. شما این تمرین را با موفقیت تکمیل
                کرده‌اید.
                {exercise.score !== null && exercise.score !== undefined && (
                  <span className="font-semibold">
                    {" "}
                    نمره دریافتی: {exercise.score}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

        {/* Feedback Display for Trainees */}
        {profile?.role === "trainee" && exercise.feedback && (
          <TraineeFeedbackDisplay
            feedback={exercise.feedback}
            score={exercise.score}
          />
        )}

        {profile?.role === "trainee" &&
          exercise.submission_status !== "completed" && (
            <TraineeExerciseForm
              exercise={exercise}
              answers={answers}
              onAnswersChange={setAnswers}
              onSubmit={handleSubmit}
              submitting={submitMutation.isPending}
            />
          )}

        {(profile?.role === "trainer" || profile?.role === "admin") && (
          <>
            {exercise.exercise_type === "form" &&
            exercise.form_structure &&
            exercise.form_structure.questions.length > 0 ? (
              <InstructorFormView formStructure={exercise.form_structure} />
            ) : exercise.exercise_type === "video" && exercise.content_url ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای تمرین ویدیویی</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-4">
                    آدرس ویدیو:{" "}
                    <a
                      href={exercise.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {exercise.content_url}
                    </a>
                  </p>
                  <video
                    className="w-full rounded-md max-h-[400px]"
                    controls
                    src={exercise.content_url}
                  />
                </div>
              </div>
            ) : exercise.exercise_type === "audio" && exercise.content_url ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای تمرین صوتی</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-4">
                    آدرس فایل صوتی:{" "}
                    <a
                      href={exercise.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {exercise.content_url}
                    </a>
                  </p>
                  <audio
                    className="w-full"
                    controls
                    src={exercise.content_url}
                  />
                </div>
              </div>
            ) : exercise.exercise_type === "simple" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای تمرین ساده</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>
                    این یک تمرین ساده است که دانشجویان با کلیک روی دکمه «تکمیل
                    تمرین» آن را تکمیل می‌کنند.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="bg-blue-50 p-4 rounded-md mt-6">
              <h3 className="text-md font-semibold mb-2 flex items-center">
                {exercise.auto_grade ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span>نمره‌دهی خودکار فعال است</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                    <span>نیاز به بررسی و نمره‌دهی دارد</span>
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-700">
                {exercise.auto_grade
                  ? "دانشجویان بلافاصله پس از تکمیل تمرین نمره دریافت می‌کنند."
                  : "تمرین‌ها پس از بررسی شما نمره‌دهی خواهند شد."}
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
