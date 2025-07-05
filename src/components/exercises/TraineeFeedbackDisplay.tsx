import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TraineeFeedbackDisplayProps {
  feedback: string;
  score?: number | null;
}

export const TraineeFeedbackDisplay = ({
  feedback,
  score,
}: TraineeFeedbackDisplayProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          بازخورد استاد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded-md border border-blue-200">
          <p className="text-gray-800 whitespace-pre-wrap">{feedback}</p>
          {score !== null && score !== undefined && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="text-blue-800 font-semibold">
                نمره: {score}/100
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
