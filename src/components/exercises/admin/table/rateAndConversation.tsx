import { SubmissionViewer } from "@/components/exercises/SubmissionViewer";
import { ExerciseConversation } from "@/components/exercises/ExerciseConversation";
import { Submission } from "@/types/reviewSubmissions";
import React from "react";

interface RateAndConversationProps {
  selectedSubmission: Submission | null;
  onClose?: () => void; // Add onClose prop
}

// Helper function to parse submission solution based on exercise type
const parseSubmissionSolution = (
  solution: string,
  exercise_type?: string
): { answers: any[]; userFeedback?: string } => {
  try {
    const parsedSolution = JSON.parse(solution);
    if (parsedSolution && typeof parsedSolution === "object") {
      if (parsedSolution.exerciseType === "media" && parsedSolution.feedback) {
        return {
          answers: Array.isArray(parsedSolution.answers)
            ? parsedSolution.answers
            : [],
          userFeedback: parsedSolution.feedback,
        };
      }
      if (
        (exercise_type === "video" ||
          exercise_type === "audio" ||
          exercise_type === "simple") &&
        parsedSolution.feedback
      ) {
        return {
          answers: [],
          userFeedback: parsedSolution.feedback,
        };
      }
    }
    return {
      answers: Array.isArray(parsedSolution) ? parsedSolution : [],
    };
  } catch (e) {
    return { answers: [] };
  }
};

const RateAndConversation: React.FC<RateAndConversationProps> = ({ selectedSubmission, onClose }) => {
  if (!selectedSubmission || !selectedSubmission.exercise) return null;
  return (
    <>
      <SubmissionViewer
        form={
          (selectedSubmission.exercise.form_structure && 
           typeof selectedSubmission.exercise.form_structure === 'object' && 
           'questions' in selectedSubmission.exercise.form_structure) 
            ? selectedSubmission.exercise.form_structure 
            : { questions: [] }
        }
        answers={
          parseSubmissionSolution(
            selectedSubmission.solution,
            selectedSubmission.exercise?.exercise_type
          ).answers
        }
        submissionInfo={{
          studentName: `${selectedSubmission.student?.first_name} ${selectedSubmission.student?.last_name}`,
          submittedAt: selectedSubmission.submitted_at,
          score: selectedSubmission.score || undefined,
          feedback: selectedSubmission.feedback || undefined
        }}
      />
      <ExerciseConversation
        submission={selectedSubmission}
        variant="compact"
        onClose={onClose}
      />
    </>
  );
};

export default RateAndConversation; 