import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { FeedbackForm } from "../FeedbackForm";

interface VideoPlayerProps {
  videoUrl: string;
  onComplete: (feedback: string) => void;
  isCompleted: boolean;
  disabled: boolean;
}

export const VideoPlayer = ({
  videoUrl,
  onComplete,
  isCompleted,
  disabled,
}: VideoPlayerProps) => {
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const percentage = (video.currentTime / video.duration) * 100;
    setWatchedPercentage(Math.floor(percentage));

    // Enable completion button when watched at least 90% of the video
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
        title="بازخورد ویدیو"
        description="شما ۹۰٪ از ویدیو را تماشا کردید. برای تکمیل تمرین، لطفاً بازخورد خود را وارد کنید."
        placeholder="لطفاً نظرات خود درباره محتوای ویدیو، نکات آموخته شده یا سوالاتی که دارید را بنویسید..."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {hasError ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>
              خطا در بارگذاری ویدیو. لطفاً مطمئن شوید آدرس ویدیو صحیح است و
              دسترسی به آن امکان‌پذیر است.
            </span>
          </div>
        ) : (
          <>
            <video
              className="w-full rounded-md"
              controls
              onTimeUpdate={handleTimeUpdate}
              onError={handleError}
              src={videoUrl}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-500">پیشرفت:</span>
                <Progress value={watchedPercentage} className="w-32" />
                <span className="text-sm">{watchedPercentage}%</span>
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
