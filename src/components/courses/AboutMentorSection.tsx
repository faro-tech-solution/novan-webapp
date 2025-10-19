'use client';

import { PublicCourse } from '@/types/course';

interface AboutMentorSectionProps {
  course: PublicCourse;
}

const AboutMentorSection = ({ course }: AboutMentorSectionProps) => {
  if (!course.instructor_name) {
    return null;
  }

  return (
    <section id="mentor" className="bg-gradient-to-br border border-blue-200 from-blue-50 to-indigo-50 rounded-lg p-8">
      <div className="flex md:flex-row flex-col gap-8 items-center">
        <div className="flex-shrink-0">
          <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
            <img 
              src="/hamid-avatar.png" 
              alt={course.instructor_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4" dir="rtl">
          <h2 className="text-3xl text-gray-900 mb-4 relative inline-block w-full">
            <span className="relative inline-block">
              سخنی با شما از زبان مربی دوره
            </span>
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            من <span className="text-blue-600 font-normal">{course.instructor_name}</span>، به عنوان مربی شما با بیش از <span className="text-blue-600 font-semibold">۱۵ سال تجربه عملی</span> در حوزه برنامه نویسی، هوش مصنوعی و توسعه استارتاپ‌ها در <span className="text-blue-600 font-semibold">پروژه‌های بین المللی</span>، اینجا هستم تا تمام تجربیات و دانش خود را با شما به اشتراک بگذارم.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            هدف من این است که شما نه تنها یک کدنویس، بلکه یک <span className="text-red-600 font-normal">مهندس نرم‌افزار خلاق و چابک</span> شوید که می‌تواند از پتانسیل کامل فناوری‌های روز برای خلق ارزش استفاده کند.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutMentorSection;
