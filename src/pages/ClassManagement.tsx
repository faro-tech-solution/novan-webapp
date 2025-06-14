
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Search, MoreHorizontal, UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ClassManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const classes = [
    {
      id: '1',
      name: 'Web Development Basics',
      students: 24,
      exercises: 12,
      averageScore: 85,
      instructor: 'John Trainer',
      startDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Advanced JavaScript',
      students: 18,
      exercises: 8,
      averageScore: 78,
      instructor: 'Sarah Wilson',
      startDate: '2025-02-01',
      status: 'active'
    },
    {
      id: '3',
      name: 'React Fundamentals',
      students: 15,
      exercises: 6,
      averageScore: 92,
      instructor: 'Mike Johnson',
      startDate: '2025-03-01',
      status: 'upcoming'
    }
  ];

  const students = [
    { id: '1', name: 'Jane Student', email: 'jane@example.com', classId: '1', joinDate: '2025-01-15', status: 'active' },
    { id: '2', name: 'Bob Learner', email: 'bob@example.com', classId: '1', joinDate: '2025-01-16', status: 'active' },
    { id: '3', name: 'Alice Wonder', email: 'alice@example.com', classId: '2', joinDate: '2025-02-01', status: 'active' },
    { id: '4', name: 'Charlie Brown', email: 'charlie@example.com', classId: '1', joinDate: '2025-01-20', status: 'inactive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Class Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
            <p className="text-gray-600">Manage your classes and students</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>

        {/* Classes Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    <CardDescription>
                      Instructor: {classItem.instructor}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(classItem.status)}>
                    {classItem.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{classItem.students}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exercises:</span>
                    <span className="font-medium">{classItem.exercises}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{classItem.averageScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{classItem.startDate}</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-1" />
                      View Students
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student enrollments and status</CardDescription>
              </div>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Student
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{studentClass?.name || 'No Class'}</TableCell>
                      <TableCell>{student.joinDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClassManagement;
