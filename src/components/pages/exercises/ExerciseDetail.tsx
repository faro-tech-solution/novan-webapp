'use client';

import React, { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { FormAnswer } from "@/types/formBuilder";
import { ExerciseDetailHeader } from "@/components/exercises/ExerciseDetailHeader";
import { ExerciseInfoCard } from "@/components/exercises/ExerciseInfoCard";
import { TraineeExerciseForm } from "@/components/exercises/TraineeExerciseForm";
import { TraineeFeedbackDisplay } from "@/components/exercises/TraineeFeedbackDisplay";
import { InstructorFormView } from "@/components/exercises/InstructorFormView";
import { ExerciseConversation } from "@/components/exercises/ExerciseConversation";
import { useExerciseDetailQuery, useSubmitExerciseMutation } from "@/hooks/queries/useExerciseDetailQuery";
import { Submission } from "@/types/reviewSubmissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ExerciseDetail = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
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

  // Create submission object for conversation component
  const createSubmissionObject = (): Submission | null => {
    if (!exercise || !exercise.submission_id || !user) return null;
    
    return {
      id: exercise.submission_id,
      exercise_id: exercise.id,
      student_id: user.id,
      submitted_at: new Date().toISOString(), // This would ideally come from the submission data
      score: exercise.score || null,
      feedback: exercise.feedback || null,
      graded_at: null,
      graded_by: null,
      solution: JSON.stringify(exercise.submission_answers || []),
      student: {
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: profile?.email || ''
      },
      exercise: {
        id: exercise.id,
        title: exercise.title,
        points: exercise.points,
        form_structure: exercise.form_structure || null,
        course_id: exercise.course_id,
        exercise_type: exercise.exercise_type as 'form' | 'video' | 'audio' | 'simple',
        auto_grade: exercise.auto_grade
      }
    };
  };

  const handleSubmit = async (feedback?: string) => {
    if (!exercise || !user || !profile) return;

    submitMutation.mutate(
      {
        exerciseId: exercise.id,
        studentId: user.id,
        answers,
        courseId: exercise.course_id, // Pass courseId from hook
        feedback: feedback || "", // Include feedback in submission
      },
      {
        onSuccess: () => {
          // Navigate to the correct trainee URL structure
          if (profile?.role === "trainee" && exercise.course_id) {
            router.push(`/trainee/${exercise.course_id}/my-exercises`);
          } else {
            router.push("/my-exercises");
          }
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
          <button onClick={() => router.back()} className="mt-4">
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
          onBack={() => router.back()}
          difficulty={exercise.difficulty}
          estimatedTime={exercise.estimated_time}
          points={exercise.points}
          submissionStatus={exercise.submission_status}
        />

        <ExerciseInfoCard
          title={exercise.title}
          courseName={exercise.course_name}
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
              userId={user?.id}
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
            ) : exercise.exercise_type === "iframe" && exercise.iframe_html ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای تمرین iframe</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">کد HTML iframe:</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                        {exercise.iframe_html}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-white rounded-md overflow-hidden border">
                    <div 
                      dangerouslySetInnerHTML={{ __html: exercise.iframe_html }}
                    />
                  </div>
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
            ) : exercise.exercise_type === "spotplayer" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای تمرین SpotPlayer</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-700">شناسه دوره SpotPlayer:</p>
                    <p className="text-gray-900 font-mono">{exercise.metadata?.spotplayer_course_id || 'تعریف نشده'}</p>
                  </div>
                  {exercise.metadata?.spotplayer_item_id && (
                    <div>
                      <p className="font-medium text-sm text-gray-700">شناسه آیتم SpotPlayer:</p>
                      <p className="text-gray-900 font-mono">{exercise.metadata.spotplayer_item_id}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    این تمرین از پلتفرم SpotPlayer استفاده می‌کند. دانشجویان برای مشاهده ویدیو نیاز به لایسنس معتبر دارند.
                  </p>
                </div>
              </div>
            ) : exercise.exercise_type === "arvan_video" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای ویدیو آروان</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-700">شناسه ویدیو:</p>
                    <p className="text-gray-900 font-mono">{exercise.metadata?.arvan_video_id || 'تعریف نشده'}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    این تمرین از سرویس ویدیو آروان کلود استفاده می‌کند. ویدیو از طریق CDN ایمن آروان ارائه می‌شود.
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

        {/* Exercise Conversation */}
        {exercise.submission_id && createSubmissionObject() && (
          <ExerciseConversation
            submission={createSubmissionObject()!}
            variant="full"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
