import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GradingSectionProps {
  score: string;
  feedback: string;
  grading: boolean;
  onScoreChange: (score: string) => void;
  onFeedbackChange: (feedback: string) => void;
  onSubmitGrade: () => void;
  maxScore: number;
}

export const GradingSection: React.FC<GradingSectionProps> = ({
  score,
  feedback,
  grading,
  onScoreChange,
  onFeedbackChange,
  onSubmitGrade,
  maxScore,
}) => {
  const isScoreValid =
    score &&
    score.trim() !== "" &&
    !isNaN(Number(score)) &&
    Number(score) >= 0 &&
    Number(score) <= maxScore;

  return (
    <Card>
      <CardHeader>
        <CardTitle>نمره‌دهی</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            نمره (از 0 تا {maxScore}) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            max={maxScore}
            value={score}
            onChange={(e) => onScoreChange(e.target.value)}
            placeholder="نمره را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">بازخورد</label>
          <Textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="بازخورد خود را وارد کنید..."
            rows={4}
          />
        </div>
        <Button onClick={onSubmitGrade} disabled={grading || !isScoreValid}>
          {grading ? "در حال ثبت..." : "ثبت نمره و بازخورد"}
        </Button>
      </CardContent>
    </Card>
  );
};
