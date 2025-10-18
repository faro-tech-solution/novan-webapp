'use client';

import { ChevronRight } from 'lucide-react';

interface WhatYoullLearnSectionProps {
  topics?: string[];
}

const WhatYoullLearnSection = ({ topics }: WhatYoullLearnSectionProps) => {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 relative inline-block w-full">
        <span className="relative inline-block">
          در این دوره چه چیزی یاد می‌گیریم؟
        </span>
      </h2>
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <ul className="space-y-4" dir="rtl">
          {topics.map((topic, index) => (
            <li key={index} className="flex items-start gap-4 text-gray-700">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <ChevronRight className="w-4 h-4 text-blue-600 rotate-180" />
              </div>
              <span className="flex-1 leading-relaxed text-lg">{topic}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhatYoullLearnSection;
