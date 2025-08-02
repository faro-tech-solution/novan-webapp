import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StudentCourse } from '@/types/course';

const fetchStudentCourses = async (userId: string | undefined, courseId?: string): Promise<StudentCourse[]> => {
  console.log('🔍 Fetching student courses for user:', userId);
  
  if (!userId) {
    console.log('❌ No user ID provided');
    return [];
  }

  console.log('📊 Querying course_enrollments table...');
  let query = supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      enrolled_at,
      status,
      courses (
        id,
        name,
        description
      )
    `)
    .eq('student_id', userId)
    .eq('status', 'active');

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data: enrollments, error: enrollmentsError } = await query;

  console.log('📋 Enrollments query result:', { 
    count: enrollments?.length || 0, 
    error: enrollmentsError,
    enrollments: enrollments?.slice(0, 3) // Log first 3 for debugging
  });

  if (enrollmentsError) {
    console.error('❌ Enrollments error:', enrollmentsError);
    throw new Error(`خطا در دریافت دوره‌ها: ${enrollmentsError.message}`);
  }

  const enrollmentsWithCourses = (enrollments || []).filter(
    (enrollment) => enrollment.courses && typeof enrollment.courses === 'object' && !('code' in enrollment.courses)
  );

  console.log('✅ Filtered enrollments:', { 
    total: enrollments?.length || 0, 
    valid: enrollmentsWithCourses.length 
  });

  // Transform the data to match the StudentCourse interface
  const transformedCourses = enrollmentsWithCourses.map(enrollment => {
    const course = enrollment.courses as { name: string; description: string | null } | null;
    return {
      id: enrollment.course_id,
      title: course?.name ?? '',
      instructor: 'نامشخص', // Default value since instructor_name doesn't exist
      progress: 0, // This would need to be calculated based on completed lessons
      totalLessons: 0, // This would need to be fetched from lessons table
      completedLessons: 0, // This would need to be calculated from student progress
      duration: '0 ساعت', // This would need to be calculated from lessons
      difficulty: 'متوسط', // Default value since column doesn't exist
      category: 'عمومی', // Default value since column doesn't exist
      thumbnail: '', // Default value since column doesn't exist
      enrollDate: enrollment.enrolled_at,
      nextLesson: null, // This would need to be calculated based on progress
      status: enrollment.status as 'active' | 'completed',
      description: course?.description ?? undefined
    };
  });

  console.log('🎯 Transformed courses:', { 
    count: transformedCourses.length,
    courses: transformedCourses.map(c => ({ id: c.id, title: c.title, status: c.status }))
  });

  return transformedCourses;
};

export const useStudentCoursesQuery = (courseId?: string) => {
  const { user } = useAuth();

  console.log('👤 Current user in useStudentCoursesQuery:', { 
    id: user?.id, 
    email: user?.email,
    hasUser: !!user 
  });

  return useQuery({
    queryKey: ['student-courses', user?.id, courseId],
    queryFn: () => fetchStudentCourses(user?.id, courseId),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
}; 