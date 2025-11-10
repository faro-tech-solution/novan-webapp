'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CoursePreviewData } from '@/types/course';

interface FAQSectionProps {
  previewData?: CoursePreviewData | null;
}

const FAQSection = ({ previewData }: FAQSectionProps) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  
  const faqs = previewData?.faqs ?? [];

  return (
    <section className="space-y-6">
      <h2 className="text-3xl text-gray-900 text-center relative inline-block w-full">
        <span className="relative inline-block">
          پاسخ به سوالات پر تکرار
        </span>
      </h2>
      <div className="space-y-3">
        {faqs.map((faq: { question: string; answer: string; }, index: number) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
              dir="rtl"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {index + 1}
                </span>
                <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  openFaqIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openFaqIndex === index && (
              <div className="px-6 pb-4 pt-2 text-gray-700 leading-relaxed" dir="rtl">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
