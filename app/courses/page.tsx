import { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/public/Footer';
import CoursesPageContent from '@/components/pages/courses/CoursesPageContent';

export const metadata: Metadata = {
  title: 'دوره‌های آموزشی - Novan',
  description: 'مشاهده تمام دوره‌های آموزشی موجود در پلتفرم Novan',
  keywords: ['دوره', 'آموزش', 'یادگیری', 'کورس', 'Novan'],
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              دوره‌های آموزشی
            </h1>
            <p className="text-lg text-gray-600">
              در دوره‌های آموزشی ما شرکت کنید و از تجربیات ارزشمند بهره‌مند شوید
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<CoursesPageSkeleton />}>
          <CoursesPageContent />
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function CoursesPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Filter skeleton */}
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Course grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
    </div>
  );
}
