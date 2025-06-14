
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsStats from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import StudentsTable from '@/components/StudentsTable';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock students data
  const students = [
    {
      id: 1,
      name: 'سارا احمدی',
      email: 'sara.ahmadi@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۵/۱۵',
      status: 'active',
      completedExercises: 12,
      totalExercises: 15,
      averageScore: 88,
      lastActivity: '۲ ساعت پیش',
      totalPoints: 1240
    },
    {
      id: 2,
      name: 'علی محمدی',
      email: 'ali.mohammadi@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۵/۲۰',
      status: 'active',
      completedExercises: 10,
      totalExercises: 15,
      averageScore: 92,
      lastActivity: '۱ روز پیش',
      totalPoints: 1380
    },
    {
      id: 3,
      name: 'فاطمه رضایی',
      email: 'fatemeh.rezaei@example.com',
      className: 'توسعه وب پیشرفته',
      joinDate: '۱۴۰۳/۰۴/۱۰',
      status: 'active',
      completedExercises: 18,
      totalExercises: 20,
      averageScore: 95,
      lastActivity: '۳۰ دقیقه پیش',
      totalPoints: 1710
    },
    {
      id: 4,
      name: 'محمد حسینی',
      email: 'mohammad.hosseini@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۶/۰۱',
      status: 'inactive',
      completedExercises: 5,
      totalExercises: 15,
      averageScore: 72,
      lastActivity: '۱ هفته پیش',
      totalPoints: 360
    },
    {
      id: 5,
      name: 'زهرا کریمی',
      email: 'zahra.karimi@example.com',
      className: 'موبایل اپلیکیشن',
      joinDate: '۱۴۰۳/۰۵/۰۸',
      status: 'active',
      completedExercises: 14,
      totalExercises: 16,
      averageScore: 89,
      lastActivity: '۴ ساعت پیش',
      totalPoints: 1246
    }
  ];

  const classes = ['توسعه وب مقدماتی', 'توسعه وب پیشرفته', 'موبایل اپلیکیشن'];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || student.className === classFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <DashboardLayout title="مدیریت دانشجویان">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت دانشجویان</h2>
            <p className="text-gray-600">مشاهده و مدیریت دانشجویان کلاس‌های شما</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 ml-2" />
            افزودن دانشجو
          </Button>
        </div>

        {/* Stats Cards */}
        <StudentsStats students={students} />

        {/* Filters */}
        <StudentsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          classes={classes}
        />

        {/* Students Table */}
        <StudentsTable students={students} filteredStudents={filteredStudents} />
      </div>
    </DashboardLayout>
  );
};

export default Students;
