'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicCourse } from '@/types/course';
import { 
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductHeaderSection from './ProductHeaderSection';
import VideoIntroductionSection from './VideoIntroductionSection';
import WhyDifferentSection from './WhyDifferentSection';
import WhoIsForSection from './WhoIsForSection';
import FAQSection from './FAQSection';
import TestimonialsSection from './TestimonialsSection';
import AboutMentorSection from './AboutMentorSection';
import WhatYoullLearnSection from './WhatYoullLearnSection';
import PricingSection from './PricingSection';

interface PublicCourseDetailProps {
  course: PublicCourse;
}

const PublicCourseDetail = ({ course }: PublicCourseDetailProps) => {
  const router = useRouter();
  const previewData = course.preview_data;

  const handlePaymentRedirect = () => {
    router.push(`/courses/${course.slug}/payment`);
  };

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600" dir="rtl">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              خانه
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href="/" className="hover:text-blue-600 transition-colors">
              دوره‌های آموزشی
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{course.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Header Section */}
        <ProductHeaderSection course={course} />

        {/* Course Description */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="space-y-12">
                <div
                  className="prose prose-gray max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-li:marker:text-gray-500"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: course.preview_data?.description || '' }}
                />

                {/* Video Introduction */}
                <VideoIntroductionSection videos={previewData?.intro_videos || []} />

                {/* What You'll Learn */}
                <WhatYoullLearnSection topics={previewData?.topics} />

                {/* About Mentor */}
                <AboutMentorSection course={course} />

                {/* Why Different */}
                <WhyDifferentSection previewData={previewData} />

                {/* Who Is This For */}
                <WhoIsForSection previewData={previewData} courseName={course.name} />

                {/* FAQ Section */}
                <FAQSection previewData={previewData} />

                {/* Testimonials */}
                <TestimonialsSection previewData={previewData} courseName={course.name} />

                {/* Pricing Section */}
                <PricingSection price={course.price} onPaymentRedirect={handlePaymentRedirect} />

                {/* Final CTA Banner */}
                <section className="relative bg-blue-600 rounded-lg p-12 text-center text-white overflow-hidden">
                  {/* Bear background image positioned in bottom left */}
                  <div 
                    className="absolute bottom-0 left-[30px] w-64 h-64 bg-cover bg-no-repeat bg-center"
                    style={{
                      backgroundImage: 'url(/bear-focus.png)',
                      backgroundPosition: 'bottom left'
                    }}
                  />
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      آینده‌ای درخشان در انتظار شماست!
                    </h2>
                    <p className="text-lg mb-8 max-w-3xl mx-auto">
                      برای شروع این مسیر هیجان‌انگیز، کافیست بر روی دکمه <span className="text-yellow-300 font-semibold">"ثبت‌نام در دوره"</span> کلیک کنید و مراحل ثبت‌نام را تکمیل نمایید.
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handlePaymentRedirect}
                      className="bg-white text-blue-600 hover:bg-blue-400 hover:text-white px-12 py-6 text-lg rounded-full font-bold"
                    >
                      ثبت‌نام در دوره و شروع مسیر حرفه‌ای خود!
                    </Button>
                    <p className="mt-6 text-sm">
                      همین امروز اولین قدم را برای تبدیل شدن به یک حرفه‌ای بردارید.
                    </p>
                  </div>
                </section>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PublicCourseDetail;
