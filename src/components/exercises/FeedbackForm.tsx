import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void;
  isSubmitting: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
}

export const FeedbackForm = ({
  onSubmit,
  isSubmitting,
  placeholder = "لطفاً نظرات، سوالات یا نکاتی که در هنگام انجام این تمرین داشتید را بنویسید...",
  title = "بازخورد و نظرات",
  description = "برای تکمیل این تمرین، لطفاً بازخورد خود را وارد کنید",
}: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError("لطفاً بازخورد خود را وارد کنید");
      return;
    }

    if (feedback.trim().length < 10) {
      setError("بازخورد باید حداقل ۱۰ کاراکتر باشد");
      return;
    }

    setError("");
    onSubmit(feedback.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback">بازخورد شما</Label>
          <RichTextEditor
            value={feedback}
            onChange={(value) => {
              setFeedback(value);
              if (error) setError("");
            }}
            placeholder={placeholder}
            height="120px"
            readOnly={isSubmitting}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">
            {feedback.length}/500 کاراکتر (حداقل ۱۰ کاراکتر)
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || !feedback.trim() || feedback.trim().length < 10
            }
            className="min-w-[120px]"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "در حال ارسال..." : "تکمیل تمرین"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
