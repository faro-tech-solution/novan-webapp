'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import PublicCourseDetail from '@/components/courses/PublicCourseDetail';
import { fetchCourseBySlug } from '@/services/courseService';
import { PublicCourse } from '@/types/course';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Footer from '@/components/public/Footer';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCourseBySlug(slug);
      
      if (data) {
        setCourse(data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error loading course:', err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center max-w-md mx-auto px-4">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              دوره یافت نشد
            </h1>
            <p className="text-gray-600 mb-8">
              متأسفانه دوره مورد نظر شما یافت نشد یا در حال حاضر فعال نیست.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                بازگشت به صفحه اصلی
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <PublicCourseDetail course={course} />
      <Footer />
    </>
  );
}


