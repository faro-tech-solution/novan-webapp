
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  difficulty: string;
  category: string;
  thumbnail: string;
  enrollDate: string;
  nextLesson: string | null;
  status: 'active' | 'completed';
  description?: string;
}

export const useStudentCourses = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStudentCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching student courses for user:', user.id);

      // First, get the user's enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('id, status, enrolled_at, course_id')
        .eq('student_id', user.id);

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        setError(enrollmentError.message);
        return;
      }

      console.log('Fetched enrollments:', enrollments);

      if (!enrollments || enrollments.length === 0) {
        setCourses([]);
        return;
      }

      // Get course IDs from enrollments
      const courseIds = enrollments.map(enrollment => enrollment.course_id);

      // Fetch course details separately
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, description, instructor_name, start_date, end_date, status')
        .in('id', courseIds);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        setError(coursesError.message);
        return;
      }

      console.log('Fetched courses:', coursesData);

      // Transform the data to match the StudentCourse interface
      const transformedCourses: StudentCourse[] = enrollments
        .map((enrollment: any) => {
          const course = coursesData?.find(c => c.id === enrollment.course_id);
          if (!course) return null;

          const enrollDate = new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR');
          
          // Mock progress data (in a real app, this would come from course progress tracking)
          const mockProgress = Math.floor(Math.random() * 100);
          const mockTotalLessons = Math.floor(Math.random() * 30) + 10;
          const mockCompletedLessons = Math.floor((mockProgress / 100) * mockTotalLessons);
          
          return {
            id: course.id,
            title: course.name,
            instructor: course.instructor_name,
            progress: mockProgress,
            totalLessons: mockTotalLessons,
            completedLessons: mockCompletedLessons,
            duration: `${Math.floor(Math.random() * 15) + 5} ساعت`,
            difficulty: ['مبتدی', 'متوسط', 'پیشرفته'][Math.floor(Math.random() * 3)],
            category: 'برنامه‌نویسی',
            thumbnail: '/placeholder.svg',
            enrollDate,
            nextLesson: mockProgress < 100 ? `درس ${mockCompletedLessons + 1}` : null,
            status: mockProgress >= 100 ? 'completed' : 'active',
            description: course.description
          };
        })
        .filter(course => course !== null) as StudentCourse[];

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error in fetchStudentCourses:', err);
      setError('خطا در دریافت دوره‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentCourses();
  }, [user]);

  return {
    courses,
    loading,
    error,
    refetch: fetchStudentCourses
  };
};
