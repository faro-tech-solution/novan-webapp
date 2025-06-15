
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Award } from 'lucide-react';

interface ExerciseWithSubmission {
  id: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  score: number | null;
}

interface MyExerciseStatsCardsProps {
  exercises: ExerciseWithSubmission[];
}

export const MyExerciseStatsCards = ({ exercises }: MyExerciseStatsCardsProps) => {
  const stats = {
    total: exercises.length,
    completed: exercises.filter(e => e.submission_status === 'completed').length,
    pending: exercises.filter(e => e.submission_status === 'pending').length,
    overdue: exercises.filter(e => e.submission_status === 'overdue').length,
    averageScore: exercises.filter(e => e.score !== null).length > 0 
      ? Math.round(
          exercises.filter(e => e.score !== null).reduce((sum, e) => sum + (e.score || 0), 0) /
          exercises.filter(e => e.score !== null).length
        )
      : 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل تمرین‌ها</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">در انتظار بررسی</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">دیرکرد</CardTitle>
          <Clock className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
          <Award className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.averageScore > 0 ? `${stats.averageScore}%` : '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
