'use client';

import { CoursePreviewData } from '@/types/course';
import { ChevronRight } from 'lucide-react';

interface WhoIsForSectionProps {
  previewData?: CoursePreviewData | null;
  courseName?: string;
}

const WhoIsForSection = ({ previewData, courseName = "این دوره" }: WhoIsForSectionProps) => {
    if (!previewData?.who_is_for || previewData.who_is_for.length === 0) {
        return null;
    }

  return (
    <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
      <h2 className="text-3xl text-gray-900 mb-6 relative inline-block w-full">
        <span className="relative inline-block">
          دوره &quot;{courseName}&quot; برای چه کسانی طراحی شده است؟
        </span>
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed mx-auto" dir="rtl">
         <ul className="space-y-4">
           {previewData.who_is_for.map((item, index) => (
             <li key={index} className="flex items-start gap-3">
               <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
               <span>{item as string}</span>
             </li>
           ))}
        </ul>
      </div>
    </section>
  );
};

export default WhoIsForSection;
