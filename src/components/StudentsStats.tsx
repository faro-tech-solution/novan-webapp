import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Award } from 'lucide-react';
import type { Student } from './StudentsTable';

interface StudentsStatsProps {
  students: Student[];
}

export function StudentsStats({ students }: StudentsStatsProps) {
  const activeStudents = students.filter(s => s.status === 'active').length;
  const completedStudents = students.filter(s => s.status === 'completed').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تعداد کل دانشجویان</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{students.length}</div>
          <p className="text-xs text-muted-foreground">
            {activeStudents} دانشجوی فعال
          </p>
        </CardContent>
      </Card>

      {/* Course Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">توزیع دوره‌ها</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(students.map(s => s.courseName)).size}
          </div>
          <p className="text-xs text-muted-foreground">
            دوره‌های فعال
          </p>
        </CardContent>
      </Card>

      {/* Completed Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تکمیل شده‌ها</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedStudents}</div>
          <p className="text-xs text-muted-foreground">
            دانشجویان فارغ‌التحصیل
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
