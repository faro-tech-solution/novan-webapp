
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsStats from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import StudentsTable from '@/components/StudentsTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StudentData {
  id: string;
  name: string;
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

const Students = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<StudentData[]>([]);
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

      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          courses!inner(
            name,
            instructor_id
          ),
          course_terms(
            name
          )
        `);

      // Access control based on role
      if (profile?.role === 'admin') {
        // Admins can see all enrollments - no additional filter needed
      } else if (profile?.role === 'trainer') {
        // Trainers can only see enrollments for their assigned courses
        const { data: assignments } = await supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', user.id);

        if (assignments && assignments.length > 0) {
          const assignedCourseIds = assignments.map(a => a.course_id);
          query = query.in('course_id', assignedCourseIds);
        } else {
          // No assignments, return empty array
          setStudents([]);
          setLoading(false);
          return;
        }
      }

      const { data: enrollments, error } = await query;

      if (error) throw error;

      console.log('Fetched enrollments:', enrollments);

      // Transform the data and fetch real points for each student
      const transformedStudents: StudentData[] = [];
      
      for (const enrollment of enrollments || []) {
        const totalPoints = await fetchStudentPoints(enrollment.student_id);
        
        transformedStudents.push({
          id: enrollment.id,
          name: enrollment.student_name,
          email: enrollment.student_email,
          courseName: enrollment.courses?.name || 'نامشخص',
          joinDate: new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR'),
          status: enrollment.status,
          // Mock data for exercise-related fields since we don't have exercises table yet
          completedExercises: Math.floor(Math.random() * 15) + 5,
          totalExercises: 20,
          averageScore: Math.floor(Math.random() * 30) + 70,
          lastActivity: `${Math.floor(Math.random() * 7) + 1} روز پیش`,
          totalPoints: totalPoints,
          termName: enrollment.course_terms?.name || 'عمومی'
        });
      }

      setStudents(transformedStudents);

      // Extract unique course names for filter
      const uniqueCourses = [...new Set(transformedStudents.map(s => s.courseName))];
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
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
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
