'use client';

import { PublicCourse } from '@/types/course';
import { BookOpen, Headphones, Key, PlayCircle } from 'lucide-react';
import CourseEnrollmentCTA from './CourseEnrollmentCTA';
import { Card } from '../ui/card';

interface ProductHeaderSectionProps {
  course: PublicCourse;
}

const ProductHeaderSection = ({ course }: ProductHeaderSectionProps) => {
  // Mock data for demonstration - in production, these would come from the database
  const features = [
    { icon: BookOpen, title: 'آموزش مهارت محور و عملی', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
    { icon: Headphones, title: 'پشتیبانی آنلاین', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
    { icon: Key, title: 'دسترسی دائمی به ویدئوها', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' }
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-4 mb-8">
      {/* Right Column - 7/12 width: Course Image and Feature Boxes (RTL: appears on right) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Course Image */}
        <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-32 h-32 text-blue-400" />
            </div>
          )}
        </div>

        {/* Feature Boxes */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-lg p-4 shadow-sm border-2 items-center gap-2 transition-shadow ${feature.bgColor} ${feature.borderColor}`}
            >
              <div>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className={`text-gray-900 ${feature.color}`}>{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Left Column - 5/12 width: Title, Description & Price/CTA (RTL: appears on left) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Title and Description */}
        <Card className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {course.name}
          </h1>
          {course.preview_data?.side_description && (
            <div 
               className="text-gray-700 text-sm leading-relaxed [&_ul]:py-6 [&_ul]:mr-4 [&_ul]:space-y-1 [&_li]:relative [&_li]:pr-6 [&_li]:after:content-['←'] [&_li]:after:absolute [&_li]:after:right-0 [&_li]:after:top-0 [&_li]:after:text-blue-600"
              dangerouslySetInnerHTML={{ __html: course.preview_data?.side_description || '' }}
            >
            </div>
          )}
        </Card>

        {/* Price and CTA */}
         <CourseEnrollmentCTA course={course} />
      </div>
    </div>
  );
};

export default ProductHeaderSection;


