import { Star } from 'lucide-react';
import { CoursePreviewData } from '@/types/course';

interface TestimonialsSectionProps {
  previewData?: CoursePreviewData | null;
  courseName?: string;
}

const TestimonialsSection = ({ previewData, courseName = 'برنامه نویسی مدرن' }: TestimonialsSectionProps) => {
  const testimonials = previewData?.testimonials || [];

  // Don't render the section if there are no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="customer" className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl text-gray-900 mb-2 relative inline-block">
          <span className="relative">
            نظرات دانشجویان دوره
          </span>
        </h2>
        <p className="text-gray-600 text-sm">نظرات دانشجویان در رابطه با دوره {courseName}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-4" dir="rtl">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
