import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Calendar } from 'lucide-react';
import { UpcomingExercise } from '@/types/exercise';

interface UpcomingExercisesCardProps {
  exercises: UpcomingExercise[];
}

export const UpcomingExercisesCard = ({ exercises }: UpcomingExercisesCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تمرین‌های پیش رو</CardTitle>
        <CardDescription>تکالیف فعلی و آینده شما</CardDescription>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            تمرین جدیدی برای انجام وجود ندارد
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium mb-2">{exercise.title}</h4>
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <Calendar className="h-3 w-3" />
                      <span>موعد: {formatDate(exercise.due_date)}</span>
                    </span>
                    <span>{exercise.estimated_time}</span>
                    <span className="text-purple-600">{exercise.points} امتیاز</span>
                  </div>
                </div>
                <Link to={`/exercise/${exercise.id}`}>
                  <Button size="sm" className="mr-4">
                    <Play className="h-4 w-4 ml-2" />
                    شروع
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
