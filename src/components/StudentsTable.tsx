import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
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

interface StudentsTableProps {
  students: Student[];
  filteredStudents: Student[];
}

const StudentsTable = ({ students, filteredStudents }: StudentsTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غیرفعال</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">تکمیل شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    // Here you can implement a modal or navigate to a detailed view
    console.log('View student details:', student);
  };

  const handleSendEmail = (studentEmail: string) => {
    window.open(`mailto:${studentEmail}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست دانشجویان</CardTitle>
        <CardDescription>
          {filteredStudents.length} دانشجو از {students.length} دانشجو
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {students.length === 0 ? 'هنوز دانشجویی ثبت‌نام نکرده' : 'هیچ دانشجویی با این فیلتر یافت نشد'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">دانشجو</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">امتیاز کل</TableHead>
                <TableHead className="text-right">آخرین فعالیت</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{`${student.first_name} ${student.last_name}`}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-end">
                        <span>{student.email}</span>
                        <Mail className="h-3 w-3 mr-1" />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                        <span>عضو از {student.joinDate}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(student.status)}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-purple-600">{student.totalPoints}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-gray-600">{student.lastActivity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewStudent(student)}
                        title="مشاهده جزئیات"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendEmail(student.email)}
                        title="ارسال ایمیل"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
