import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/course';

const fetchEnrolledCourses = async (userId: string | undefined): Promise<Course[]> => {
  console.log('🔍 Fetching enrolled courses for user:', userId);
  
  if (!userId) {
    console.log('❌ No user ID provided');
    return [];
  }

  console.log('📊 Querying course_enrollments table...');
  const query = supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      enrolled_at,
      status,
      courses (
        id,
        name,
        description,
        instructor_id,
        status,
        max_students,
        created_at,
        updated_at,
        price,
        slug,
        thumbnail
      )
    `)
    .eq('student_id', userId)
    .eq('status', 'active');

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

  // Transform the data to match the Course interface
  const transformedCourses = enrollmentsWithCourses.map(enrollment => {
    const course = enrollment.courses as any;
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      instructor_id: course.instructor_id,
      status: course.status,
      max_students: course.max_students,
      created_at: course.created_at,
      updated_at: course.updated_at,
      price: course.price,
      slug: course.slug,
      thumbnail: course.thumbnail,
      // Add enrollment-specific data
      enrolled_at: enrollment.enrolled_at,
      enrollment_status: enrollment.status
    };
  });

  console.log('🎯 Transformed courses:', { 
    count: transformedCourses.length,
    courses: transformedCourses.map(c => ({ id: c.id, name: c.name, status: c.status }))
  });

  return transformedCourses;
};

export const useEnrolledCoursesQuery = () => {
  const { user } = useAuth();

  console.log('👤 Current user in useEnrolledCoursesQuery:', { 
    id: user?.id, 
    email: user?.email,
    hasUser: !!user 
  });

  return useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: () => fetchEnrolledCourses(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};
