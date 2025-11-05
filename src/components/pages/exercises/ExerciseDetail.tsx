'use client';

import React, { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { FormAnswer } from "@/types/formBuilder";
import { ExerciseInfoCard } from "@/components/exercises";
import { ExerciseTabs } from "@/components/exercises/tabs";
import { InstructorFormView } from "@/components/exercises/InstructorFormView";
import { ExerciseConversation } from "@/components/exercises/ExerciseConversation";
import ExerciseListSidebar from "@/components/exercises/ExerciseListSidebar";
import { useExerciseDetailQuery, useSubmitExerciseMutation } from "@/hooks/queries/useExerciseDetailQuery";
import { Submission } from "@/types/reviewSubmissions";
import { getNextExercise } from "@/services/exerciseFetchService";

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
    if (!exercise || !user) return null;
    
    return {
      id: exercise.submission_id || 'temp-submission-' + exercise.id, // Use temporary ID if no submission exists
      exercise_id: exercise.id,
      student_id: user.id,
      submitted_at: exercise.submission_id ? new Date().toISOString() : new Date().toISOString(), // Use current date as fallback
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

  const handleSubmit = async (feedback?: string, attachments?: string[]) => {
    if (!exercise || !user || !profile) return;

    submitMutation.mutate(
      {
        exerciseId: exercise.id,
        studentId: user.id,
        answers,
        courseId: exercise.course_id, // Pass courseId from hook
        feedback: feedback || "", // Include feedback in submission
        autoGrade: exercise.auto_grade, // Pass autoGrade from exercise
        attachments: attachments || [], // Pass attachments
        exerciseType: exercise.exercise_type, // Pass exercise type
      },
      {
        onSuccess: async () => {
          // Try to get the next exercise
          if (profile?.role === "trainee" && exercise.course_id) {
            try {
              const nextExercise = await getNextExercise(exercise.id, exercise.course_id);
              if (nextExercise) {
                // Redirect to the next exercise
                router.push(`/portal/trainee/${exercise.course_id}/exercise/${nextExercise.id}`);
              } else {
                // No next exercise found, redirect to exercise list
                router.push(`/portal/trainee/${exercise.course_id}/my-exercises`);
              }
            } catch (error) {
              console.error('Error getting next exercise:', error);
              // Fallback to exercise list if there's an error
              router.push(`/portal/trainee/${exercise.course_id}/my-exercises`);
            }
          } else {
            router.push("/portal/trainee/all-courses");
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
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6 p-6">
            <ExerciseInfoCard
              exercise={exercise}
              description={exercise.description}
              answers={answers}
              setAnswers={setAnswers}
              handleSubmit={handleSubmit}
              submitMutation={submitMutation}
            />

        {/* Exercise Tabs - Only visible to trainees, and only for non-form/simple exercises */}
        {profile?.role === "trainee" && exercise.exercise_type !== 'form' && exercise.exercise_type !== 'simple' && (
          <ExerciseTabs exercise={exercise} />
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

            ) : exercise.exercise_type === "negavid" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">محتوای ویدیو نگاود</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-700">شناسه ویدیو:</p>
                    <p className="text-gray-900 font-mono">{exercise.metadata?.negavid_video_id || 'تعریف نشده'}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    این تمرین از سرویس ویدیو نگاود استفاده می‌کند. ویدیو از طریق CDN ایمن نگاود ارائه می‌شود.
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

        {/* Exercise Conversation - Show for non-auto_grade exercises or simple exercises */}
        {createSubmissionObject() && (!exercise.auto_grade || exercise.exercise_type === "simple") && (
          (profile?.role === "trainee" || (
            (profile?.role === "trainer" || profile?.role === "admin") && 
            exercise.submission_id
          ))
        ) && (
          <ExerciseConversation
            submission={createSubmissionObject()!}
            variant="full"
            onExerciseSubmit={exercise.exercise_type === "simple" ? handleSubmit : undefined}
            exerciseSubmitting={exercise.exercise_type === "simple" ? submitMutation.isPending : false}
          />
        )}
          </div>
        </div>

        {/* Exercise List Sidebar - Only show for trainees */}
        {profile?.role === "trainee" && exercise.course_id && (
          <ExerciseListSidebar
            currentExerciseId={exercise.id}
            courseId={exercise.course_id}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
