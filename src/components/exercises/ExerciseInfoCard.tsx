
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface ExerciseInfoCardProps {
  title: string;
  courseName: string;
  openDate: string;
  dueDate: string;
  description?: string | null;
}

export const ExerciseInfoCard = ({
  title,
  courseName,
  openDate,
  dueDate,
  description
}: ExerciseInfoCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base space-y-2">
          <div>درس: {courseName}</div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="h-4 w-4" />
              <span>تاریخ شروع: {formatDate(openDate)}</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="h-4 w-4" />
              <span>موعد تحویل: {formatDate(dueDate)}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">توضیحات تمرین:</h4>
            <div className="whitespace-pre-wrap text-sm text-gray-700">
              {description}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
