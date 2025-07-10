import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Eye, Calendar, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { StudentDetailsDialog } from './StudentDetailsDialog';
import { StudentCoursesDialog } from './StudentCoursesDialog';
import { formatDate } from '@/lib/utils';
import { Student } from '@/types/student';
import UserNameWithBadge from '@/components/ui/UserNameWithBadge';

export interface StudentsTableProps {
  students: Student[];
  filteredStudents: Student[];
}

export const StudentsTable = ({ 
  students, 
  filteredStudents,
}: StudentsTableProps) => {
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

  const tableHeaders = [
    'نام',
    'ایمیل',
    'دوره',
    'وضعیت',
    'تاریخ ثبت‌نام',
    'عملیات'
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>لیست دانشجویان</CardTitle>
          <CardDescription>
            {filteredStudents.length} از {students.length} دانشجو
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable headers={tableHeaders}>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="text-right"><UserNameWithBadge firstName={student.first_name} lastName={student.last_name} isDemo={student.is_demo} /></TableCell>
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
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </ResponsiveTable>
        </CardContent>
      </Card>

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
    </>
  );
};
