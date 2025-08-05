
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExerciseInfoCardProps {
  title: string;
  courseName: string;
  description?: string | null;
}

export const ExerciseInfoCard = ({
  title,
  courseName,
  description
}: ExerciseInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base space-y-2">
          <div>درس: {courseName}</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">توضیحات تمرین:</h4>
            <div 
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
