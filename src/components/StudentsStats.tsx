
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  courseName: string;
  joinDate: string;
  status: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  lastActivity: string;
  totalPoints: number;
  termName?: string;
}

interface StudentsStatsProps {
  students: StudentData[];
}

const StudentsStats = ({ students }: StudentsStatsProps) => {
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    averageCompletion: students.length > 0 ? Math.round(
      students.reduce((sum, s) => sum + (s.completedExercises / s.totalExercises) * 100, 0) / students.length
    ) : 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل دانشجویان</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">فعال</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">غیرفعال</CardTitle>
          <Clock className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">میانگین تکمیل</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.averageCompletion}%</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsStats;
