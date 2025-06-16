import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsStats from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import StudentsTable from '@/components/StudentsTable';
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

  const fetchStudentPoints = async (studentId: string): Promise<number> => {
    try {
      const { data: activityLogs, error } = await supabase
        .from('student_activity_logs')
        .select('points_earned')
        .eq('student_id', studentId);

      if (error) {
        console.error('Error fetching student points:', error);
        return 0;
      }

      const totalPoints = activityLogs?.reduce((sum, log) => sum + (log.points_earned || 0), 0) || 0;
      return totalPoints;
    } catch (error) {
      console.error('Error calculating student points:', error);
      return 0;
    }
  };

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
          courseName: enrollment?.course?.name || 'بدون دوره',
          joinDate: new Date(enrollment?.enrolled_at || student.created_at).toLocaleDateString('fa-IR'),
          status: enrollment?.status || 'فعال',
          completedExercises: Math.floor(Math.random() * 15) + 5, // Mock data
          totalExercises: 20, // Mock data
          averageScore: Math.floor(Math.random() * 30) + 70, // Mock data
          lastActivity: `${Math.floor(Math.random() * 7) + 1} روز پیش`, // Mock data
          totalPoints: Math.floor(Math.random() * 1000), // Mock data
          termName: enrollment?.course_terms?.name || 'عمومی'
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
