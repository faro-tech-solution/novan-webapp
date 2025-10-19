import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import PublicCourseCard from '@/components/courses/PublicCourseCard';
import { PublicCourse } from '@/types/course';
import { fetchPublicCourses } from '@/services/courseService';
import { ArrowLeft } from 'lucide-react';

export default function CoursesSection() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPublicCourses();
      setCourses(data);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('خطا در بارگذاری دوره‌ها');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            دوره‌های آموزشی
          </h2>
          <p className="text-lg text-gray-600">
            دوره‌های متنوع برای یادگیری و پیشرفت در مسیر شغلی
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow p-6 h-96">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
            <Button onClick={loadCourses} className="mt-4">
              تلاش مجدد
            </Button>
          </div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              در حال حاضر دوره‌ای موجود نیست
            </p>
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <PublicCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/courses">
              <Button 
                size="lg"
                className="bg-gray-200 hover:bg-[#6e61b5] hover:text-white text-[#6e61b5] px-8 py-4 rounded-lg"
              >
                مشاهده همه دوره‌ها
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

