import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Mail, Calendar, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { StudentDetailsDialog } from './StudentDetailsDialog';
import { StudentCoursesDialog } from './StudentCoursesDialog';
import { formatDate } from '@/lib/utils';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  courseName: string;
  joinDate: string;
  status: string;
  termName?: string;
  role?: string;
  created_at?: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  lastActivity: string;
  totalPoints: number;
  education?: string;
  course_enrollments?: {
    course: {
      name: string;
    };
    status: string;
    enrolled_at: string;
    course_terms: {
      name: string;
    };
  }[];
}

interface StudentsTableProps {
  students: Student[];
  filteredStudents: Student[];
}

export function StudentsTable({ students, filteredStudents }: StudentsTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentForCourses, setSelectedStudentForCourses] = useState<Student | null>(null);

  const formatJoinDate = (dateString: string) => {
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست دانشجویان</CardTitle>
        <CardDescription>
          {filteredStudents.length} از {students.length} دانشجو
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">ایمیل</TableHead>
              <TableHead className="text-right">دوره</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">تاریخ ثبت‌نام</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="text-right">{student.first_name} {student.last_name}</TableCell>
                <TableCell className="text-right">{student.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setSelectedStudentForCourses(student)}
                  >
                    <BookOpen className="h-4 w-4 ml-1" />
                    {student.course_enrollments?.length || 0} دوره
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatJoinDate(student.joinDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      مشاهده جزئیات
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <StudentDetailsDialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
        student={selectedStudent}
      />

      <StudentCoursesDialog
        open={!!selectedStudentForCourses}
        onOpenChange={(open) => !open && setSelectedStudentForCourses(null)}
        studentName={selectedStudentForCourses ? `${selectedStudentForCourses.first_name} ${selectedStudentForCourses.last_name}` : ''}
        enrollments={selectedStudentForCourses?.course_enrollments || []}
      />
    </Card>
  );
}
