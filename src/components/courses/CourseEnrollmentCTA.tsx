'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PublicCourse } from '@/types/course';
import { ShoppingCart, BookOpen, CheckCircle } from 'lucide-react';

interface CourseEnrollmentCTAProps {
  course: PublicCourse;
}

const CourseEnrollmentCTA = ({ course }: CourseEnrollmentCTAProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndEnrollment();
  }, [course.id]);

  const checkAuthAndEnrollment = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.id);

        // Check if already enrolled
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('course_id', course.id)
          .eq('student_id', user.id)
          .single();

        setIsEnrolled(!!enrollment);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth/enrollment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      // Redirect to registration with return URL
      router.push(`/portal/register?returnUrl=/${course.slug}/dashboard`);
      return;
    }

    if (isEnrolled) {
      // Navigate to course content
      router.push(`/portal/trainee/${course.id}/dashboard`);
      return;
    }

    // Handle enrollment for authenticated users
    try {
      if (isFree && userId) {
        // Auto-enroll for free courses
        const { error } = await supabase
          .from('course_enrollments')
          .insert({
            course_id: course.id,
            student_id: userId,
            status: 'active',
          });

        if (error) {
          console.error('Error enrolling:', error);
          alert('خطا در ثبت‌نام. لطفا دوباره تلاش کنید.');
          return;
        }

        setIsEnrolled(true);
        alert('ثبت‌نام با موفقیت انجام شد!');
        router.push(`/portal/trainee/courses/${course.id}`);
      } else {
        // Redirect to payment page for paid courses
        router.push(`/courses/${course.slug}/payment`);
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      alert('خطا در انجام عملیات. لطفا دوباره تلاش کنید.');
    }
  };

  const isFree = !course.price || course.price === 0;

  const formatPrice = (price?: number) => {
    if (!price || price === 0) {
      return 'رایگان';
    }
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">شما در این دوره ثبت‌نام کرده‌اید</h3>
              <p className="text-sm text-green-700">به دوره خود دسترسی دارید</p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleEnrollClick}
            className="bg-green-600 hover:bg-green-700"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            ورود به دوره
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-1 px-2 border-2 border-blue-200 rounded-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="mr-4">
          <div className="flex items-center">
            <span className="text-2xl text-blue-900">
              {formatPrice(course.price)}
            </span>
          </div>
          <p className="text-xs text-gray-700 mt-[-6px]">
            {isFree 
              ? 'دوره رایگان - همین حالا شروع کنید'
              : 'دسترسی کامل و دائمی به دوره'}
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleEnrollClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-sm rounded-full"
        >
          {isFree ? (
            <>
              <BookOpen className="w-5 h-5 mr-2" />
              ثبت‌نام رایگان
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              خرید دوره
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CourseEnrollmentCTA;


