
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Mail, Award, Calendar } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  className: string;
  joinDate: string;
  status: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  lastActivity: string;
  totalPoints: number;
}

interface StudentsTableProps {
  students: Student[];
  filteredStudents: Student[];
}

const StudentsTable = ({ students, filteredStudents }: StudentsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غیرفعال</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>دانشجو</TableHead>
              <TableHead>کلاس</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>پیشرفت</TableHead>
              <TableHead>میانگین نمره</TableHead>
              <TableHead>امتیاز کل</TableHead>
              <TableHead>آخرین فعالیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-3 w-3 ml-1" />
                      {student.email}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="h-3 w-3 ml-1" />
                      عضو از {student.joinDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{student.className}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{student.completedExercises}/{student.totalExercises}</span>
                      <span>{Math.round((student.completedExercises / student.totalExercises) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full" 
                        style={{ width: `${(student.completedExercises / student.totalExercises) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-500 ml-1" />
                    <span className="font-medium">{student.averageScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-purple-600">{student.totalPoints}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{student.lastActivity}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
