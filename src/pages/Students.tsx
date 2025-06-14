
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsStats from '@/components/StudentsStats';
import StudentsFilters from '@/components/StudentsFilters';
import StudentsTable from '@/components/StudentsTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch course enrollments with course information
      const { data: enrollments, error } = await supabase
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
        `)
        .eq('courses.instructor_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      console.log('Fetched enrollments:', enrollments);

      // Transform the data to match the expected format
      const transformedStudents: StudentData[] = (enrollments || []).map((enrollment) => ({
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
        totalPoints: Math.floor(Math.random() * 1000) + 500,
        termName: enrollment.course_terms?.name || 'عمومی'
      }));

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت دانشجویان</h2>
            <p className="text-gray-600">مشاهده و مدیریت دانشجویان دوره‌های شما</p>
          </div>
          <Button onClick={() => {
            toast({
              title: 'راهنمایی',
              description: 'برای افزودن دانشجو، از بخش مدیریت دوره‌ها استفاده کنید',
            });
          }}>
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
