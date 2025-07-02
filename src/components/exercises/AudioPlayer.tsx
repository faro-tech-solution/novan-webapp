import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

interface AudioPlayerProps {
  audioUrl: string;
  onComplete: (feedback: string) => void;
  isCompleted: boolean;
  disabled: boolean;
}

export const AudioPlayer = ({
  audioUrl,
  onComplete,
  isCompleted,
  disabled,
}: AudioPlayerProps) => {
  const [listenedPercentage, setListenedPercentage] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    const percentage = (audio.currentTime / audio.duration) * 100;
    setListenedPercentage(Math.floor(percentage));

    // Enable completion button when listened to at least 90% of the audio
    if (percentage >= 90 && !canComplete) {
      setCanComplete(true);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

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
        title="بازخورد فایل صوتی"
        description="شما ۹۰٪ از فایل صوتی را شنیدید. برای تکمیل تمرین، لطفاً بازخورد خود را وارد کنید."
        placeholder="لطفاً نظرات خود درباره محتوای صوتی، نکات آموخته شده یا سوالاتی که دارید را بنویسید..."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {hasError ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>
              خطا در بارگذاری فایل صوتی. لطفاً مطمئن شوید آدرس فایل صحیح است و
              دسترسی به آن امکان‌پذیر است.
            </span>
          </div>
        ) : (
          <>
            <audio
              className="w-full"
              controls
              onTimeUpdate={handleTimeUpdate}
              onError={handleError}
              src={audioUrl}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-500">پیشرفت:</span>
                <Progress value={listenedPercentage} className="w-32" />
                <span className="text-sm">{listenedPercentage}%</span>
              </div>
              {isCompleted ? (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>تکمیل شده</span>
                </div>
              ) : canComplete ? (
                <Button
                  onClick={handleShowFeedbackForm}
                  disabled={disabled}
                  size="sm"
                >
                  تکمیل تمرین
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
