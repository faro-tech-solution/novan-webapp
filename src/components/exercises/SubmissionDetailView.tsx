import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Clock, Award } from "lucide-react";
import { SubmissionViewer } from "./SubmissionViewer";
import { ExerciseForm, FormAnswer } from "@/types/formBuilder";
import { Submission } from "@/types/reviewSubmissions";

interface SubmissionDetailViewProps {
  submission: Submission;
  onBack: () => void;
}

export const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({
  submission,
  onBack,
}) => {
  const parseFormStructure = (form_structure: any): ExerciseForm => {
    if (!form_structure) {
      return { questions: [] };
    }

    try {
      if (typeof form_structure === "string") {
        return JSON.parse(form_structure) as ExerciseForm;
      } else if (
        typeof form_structure === "object" &&
        form_structure.questions
      ) {
        return form_structure as ExerciseForm;
      }
      return { questions: [] };
    } catch (error) {
      console.error("Error parsing form_structure:", error);
      return { questions: [] };
    }
  };

  // Helper function to parse submission solution based on exercise type
  const parseSubmissionContent = (
    solution: string
  ): { answers: FormAnswer[]; userFeedback?: string } => {
    try {
      const parsedSolution = JSON.parse(solution);

      // Check if this is a video, audio, or simple exercise with feedback
      if (
        submission.exercise?.exercise_type === "video" ||
        submission.exercise?.exercise_type === "audio" ||
        submission.exercise?.exercise_type === "simple"
      ) {
        if (parsedSolution.feedback) {
          return {
            answers: [],
            userFeedback: parsedSolution.feedback,
          };
        }
      }

      // For regular form exercises, just return the parsed answers
      return {
        answers: Array.isArray(parsedSolution) ? parsedSolution : [],
      };
    } catch (e) {
      // If parsing fails, return empty answers
      console.error("Error parsing submission solution:", e);
      return { answers: [] };
    }
  };

  // Parse the solution
  const parsedContent = parseSubmissionContent(submission.solution);
  const userFeedback = parsedContent.userFeedback;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {submission.exercise?.title || 'تمرین نامشخص'}
              </CardTitle>
              <div className="mt-2">
                <div className="flex items-center space-x-4 space-x-reverse text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{`${submission.student?.first_name} ${submission.student?.last_name}`}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submitted_at).toLocaleDateString(
                        "fa-IR"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Award className="h-4 w-4" />
                    <span>{submission.exercise?.points || 0} امتیاز</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              بازگشت به لیست
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Display user feedback for video, audio, and simple exercises */}
      {userFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>بازخورد دانشجو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700">{userFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {submission.exercise?.form_structure && (
        <Card>
          <CardHeader>
            <CardTitle>پاسخ دانشجو</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionViewer
              form={parseFormStructure(submission.exercise.form_structure)}
              answers={parsedContent.answers}
              submissionInfo={{
                studentName: `${submission.student?.first_name} ${submission.student?.last_name}`,
                submittedAt: submission.submitted_at,
                score: submission.score || undefined,
                feedback: submission.feedback || undefined,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
