import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { StudentsStats } from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import { StudentsTable } from '@/components/StudentsTable';
import { useToast } from '@/hooks/use-toast';
import { useStudentsQuery } from '@/hooks/queries/useStudentsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from '@/types/student';
import { Input } from '@/components/ui/input';

const Students = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { toast } = useToast();

  const { 
    students, 
    loading, 
    error, 
    updateStudent, 
    deleteStudent 
  } = useStudentsQuery();

  // Extract unique course names for filter
  const courses = [...new Set(students.map(s => s.courseName))];

  // Filter students
  let filteredStudents = students.filter(student => {
    const matchesSearch = `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || student.courseName === courseFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });
  if (showDemoUsers) {
    filteredStudents = filteredStudents.filter(student => student.is_demo);
  } else {
    filteredStudents = filteredStudents.filter(student => !student.is_demo);
  }

  const handleUpdateStudent = async (studentId: string, updates: Partial<Student>) => {
    try {
      await updateStudent({ studentId, updates });
      toast({
        title: 'موفقیت',
        description: 'اطلاعات دانشجو با موفقیت بروزرسانی شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در بروزرسانی اطلاعات دانشجو',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      toast({
        title: 'موفقیت',
        description: 'دانشجو با موفقیت حذف شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در حذف دانشجو',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="مدیریت دانشجویان">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت دانشجویان">
        <div className="text-center text-red-500">
          خطا در بارگذاری اطلاعات دانشجویان
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت دانشجویان">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت دانشجویان</h2>
          <p className="text-gray-600">مشاهده و مدیریت دانشجویان دوره‌های شما</p>
        </div>

        {/* Stats Cards */}
        <StudentsStats students={students} />

        {/* Filters */}
        <StudentsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          courses={courses}
          showDemoUsers={showDemoUsers}
          setShowDemoUsers={setShowDemoUsers}
        />

        {/* Students Table */}
        <StudentsTable 
          students={students} 
          filteredStudents={filteredStudents}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      </div>
    </DashboardLayout>
  );
};

export default Students;
