import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

interface SimpleExerciseCompletionProps {
  onComplete: (feedback: string) => void;
  isCompleted: boolean;
  disabled: boolean;
}

export const SimpleExerciseCompletion = ({
  onComplete,
  isCompleted,
  disabled,
}: SimpleExerciseCompletionProps) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShowFeedbackForm = () => {
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    setIsSubmitting(true);
    try {
      await onComplete(feedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFeedbackForm && !isCompleted) {
    return (
      <FeedbackForm
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmitting}
        title="بازخورد تمرین"
        description="برای تکمیل این تمرین، لطفاً بازخورد خود را وارد کنید."
        placeholder="لطفاً نظرات، تجربیات یا سوالاتی که در رابطه با این تمرین دارید را بنویسید..."
      />
    );
  }
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
        {isCompleted ? (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-700">
              تمرین تکمیل شده است
            </p>
            <p className="text-gray-500">
              شما این تمرین را با موفقیت تکمیل کرده‌اید.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600">
              برای تکمیل این تمرین، روی دکمه زیر کلیک کنید.
            </p>
            <Button
              onClick={handleShowFeedbackForm}
              size="lg"
              className="px-8"
              disabled={disabled}
            >
              تکمیل تمرین
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
