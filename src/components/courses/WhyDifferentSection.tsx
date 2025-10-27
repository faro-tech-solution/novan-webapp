'use client';

import { CoursePreviewData } from '@/types/course';

interface WhyDifferentSectionProps {
  previewData: CoursePreviewData | null;
}

// Color mapping for differentiator colors - using 50 shade for backgrounds
const colorMap: Record<string, string> = {
  'blue': 'bg-blue-50',
  'purple': 'bg-purple-50',
  'green': 'bg-green-50',
  'orange': 'bg-orange-50',
  'red': 'bg-red-50',
  'yellow': 'bg-yellow-50',
  // Default gradients use blue-50
  'gradient-blue-purple': 'bg-blue-50',
  'gradient-green-blue': 'bg-green-50',
  'gradient-purple-pink': 'bg-purple-50',
};

// Border color mapping - using 400 shade for borders
const borderColorMap: Record<string, string> = {
  'blue': 'border-blue-200',
  'purple': 'border-purple-200',
  'green': 'border-green-200',
  'orange': 'border-orange-200',
  'red': 'border-red-200',
  'yellow': 'border-yellow-200',
  // Default gradients use blue-400
  'gradient-blue-purple': 'border-blue-200',
  'gradient-green-blue': 'border-green-200',
  'gradient-purple-pink': 'border-purple-200',
};

// Text color mapping - using 900 shade of the same color
const textColorMap: Record<string, string> = {
  'blue': 'text-blue-900',
  'purple': 'text-purple-900',
  'green': 'text-green-900',
  'orange': 'text-orange-900',
  'red': 'text-red-900',
  'yellow': 'text-yellow-900',
  // Default gradients use blue-900
  'gradient-blue-purple': 'text-blue-900',
  'gradient-green-blue': 'text-green-900',
  'gradient-purple-pink': 'text-purple-900',
};

const WhyDifferentSection = ({ previewData }: WhyDifferentSectionProps) => {
  // Don't render if no differentiators data
  if (!previewData?.differentiators || previewData.differentiators.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <h2 className="text-3xl text-gray-900 text-center relative inline-block w-full">
        <span className="relative inline-block">
          چه چیزی دوره را از سایر دوره‌ها متمایز می‌کند؟
        </span>
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {previewData.differentiators.map((item, index) => {
          // Get color based on the color property
          const colorClass = colorMap[item.color] || 'bg-blue-50';
          const borderColorClass = borderColorMap[item.color] || 'border-blue-400';
          const textColorClass = textColorMap[item.color] || 'text-blue-900';
          
          return (
            <div
              key={index}
              className={`${colorClass} ${borderColorClass} border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="space-y-3" dir="rtl">
                <h3 className={`text-xl ${textColorClass}`}>{item.title}</h3>
                <p className={`${textColorClass}/80 leading-relaxed`}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhyDifferentSection;
