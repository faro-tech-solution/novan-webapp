import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCache } from './useCache';
import { StudentCourse } from '@/types/course';

export const useStudentCourses = () => {
  const { user } = useAuth();

  const {
    data: courses,
    loading,
    error,
    refetch
  } = useCache<StudentCourse[]>(
    `student-courses-${user?.id}`,
    async () => {
      if (!user) return [];

      const { data: enrollments, error: enrollmentsError } = await supabase
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
            instructor:profiles(id, first_name, last_name, avatar_url)
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        throw new Error('خطا در دریافت دوره‌ها');
      }

      const enrollmentsWithCourses = enrollments || [];

      // Transform the data to match the StudentCourse interface
      const transformedCourses: StudentCourse[] = enrollmentsWithCourses
        .filter(enrollment => enrollment.courses) // Only include enrollments with valid course data
        .map((enrollment: any) => {
          const course = enrollment.courses;
          const enrollDate = new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR');
          
          // Mock progress data (in a real app, this would come from course progress tracking)
          const mockProgress = Math.floor(Math.random() * 100);
          const mockTotalLessons = Math.floor(Math.random() * 30) + 10;
          const mockCompletedLessons = Math.floor((mockProgress / 100) * mockTotalLessons);
          
          return {
            id: course.id,
            title: course.name,
            instructor: course.instructor ? `${course.instructor.first_name} ${course.instructor.last_name}` : 'نامشخص',
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
        });

      return transformedCourses;
    },
    { ttl: 5 * 60 * 1000 } // 5 minutes cache
  );

  return {
    courses: courses || [],
    loading,
    error,
    refetch
  };
};
