import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { StudentsStats } from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import { StudentsTable } from '@/components/StudentsTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Student } from '@/components/StudentsTable';

interface CourseEnrollment {
  course: {
    name: string;
  };
  status: string;
  enrolled_at: string;
  course_terms: {
    name: string;
  };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  gender: string;
  education: string;
  course_enrollments: CourseEnrollment[];
}

const Students = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          gender,
          education,
          course_enrollments (
            course:courses (
              name
            ),
            status,
            enrolled_at,
            course_terms (
              name
            )
          )
        `)
        .eq('role', 'trainee')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const students = (data as unknown as Profile[]).map(student => {
        const enrollment = student.course_enrollments?.[0];
        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          role: student.role,
          created_at: student.created_at,
          gender: student.gender,
          education_level: student.education,
          courseName: enrollment?.course?.name || 'بدون دوره',
          joinDate: enrollment?.enrolled_at || student.created_at,
          status: enrollment?.status || 'فعال',
          termName: enrollment?.course_terms?.name || 'عمومی',
          course_enrollments: student.course_enrollments,
          completedExercises: 0,
          totalExercises: 0,
          averageScore: 0,
          lastActivity: student.created_at,
          totalPoints: 0
        } as Student;
      });

      setStudents(students);

      // Extract unique course names for filter
      const uniqueCourses = [...new Set(students.map(s => s.courseName))];
      setCourses(uniqueCourses);

    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری دانشجویان',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || student.courseName === courseFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="مدیریت دانشجویان">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
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
        />

        {/* Students Table */}
        <StudentsTable students={students} filteredStudents={filteredStudents} />
      </div>
    </DashboardLayout>
  );
};

export default Students;
