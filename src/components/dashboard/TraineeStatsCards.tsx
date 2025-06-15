
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, Award } from 'lucide-react';

interface ExerciseWithSubmission {
  id: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  points: number;
}

interface TraineeStatsCardsProps {
  exercises: ExerciseWithSubmission[];
}

export const TraineeStatsCards = ({ exercises }: TraineeStatsCardsProps) => {
  const stats = {
    completedExercises: exercises.filter(e => e.submission_status === 'completed').length,
    pendingExercises: exercises.filter(e => e.submission_status === 'pending').length,
    overdueExercises: exercises.filter(e => e.submission_status === 'overdue').length,
    totalPoints: exercises
      .filter(e => e.submission_status === 'completed')
      .reduce((sum, e) => sum + e.points, 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completedExercises}</div>
          <p className="text-xs text-muted-foreground">تمرین تمام شده</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">در انتظار بررسی</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingExercises}</div>
          <p className="text-xs text-muted-foreground">منتظر نمره</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عقب‌افتاده</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdueExercises}</div>
          <p className="text-xs text-muted-foreground">تمرین دیرکرد</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مجموع امتیاز</CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
          <p className="text-xs text-muted-foreground">امتیاز کسب شده</p>
        </CardContent>
      </Card>
    </div>
  );
};
