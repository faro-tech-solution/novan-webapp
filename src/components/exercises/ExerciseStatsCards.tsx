
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Award, 
  Edit, 
  AlertTriangle, 
  Users, 
  FileText 
} from 'lucide-react';
import { Exercise } from '@/types/exercise';

interface ExerciseStatsCardsProps {
  exercises: Exercise[];
}

export const ExerciseStatsCards = ({ exercises }: ExerciseStatsCardsProps) => {
  const stats = {
    total: exercises.length,
    active: exercises.filter(e => e.exercise_status === 'active').length,
    upcoming: exercises.filter(e => e.exercise_status === 'upcoming').length,
    closed: exercises.filter(e => e.exercise_status === 'closed').length,
    overdue: exercises.filter(e => e.exercise_status === 'overdue').length,
    averageSubmissionRate: exercises.length > 0 ? Math.round(
      exercises.reduce((sum, e) => sum + ((e.submissions || 0) / (e.total_students || 1)) * 100, 0) / exercises.length
    ) : 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
          <CardTitle className="text-sm font-medium">فعال</CardTitle>
          <Clock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">آینده</CardTitle>
          <Award className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">بسته</CardTitle>
          <Edit className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عقب‌افتاده</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نرخ ارسال</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.averageSubmissionRate}%</div>
        </CardContent>
      </Card>
    </div>
  );
};
