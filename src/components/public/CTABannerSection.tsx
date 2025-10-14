import { Button } from "@/components/ui/button";
import { RocketIcon } from 'lucide-react';
import Image from 'next/image';

export default function CTABannerSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center justify-items-center">
            {/* Text Content */}
            <div className="inline-block p-4 sm:p-8 lg:p-8 text-right space-y-6 bg-gray-50 shadow-sm rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-bold">
                شروع کسب و کار جدید با تکنولوژی روز
              </h2>
              <p className="text-gray-600 leading-relaxed">
                اگر دنبال شروع یک کسب و کار جدید هستید و می‌خواهید ایده‌های خود را راه‌اندازی کنید، 
                استفاده از فناوری‌های نوین در بخش‌های مختلف به شما کمک می‌کند تا با هزینه پایین، 
                بالاترین بهره‌وری و احتمال موفقیت را داشته باشید.
              </p>
              <Button 
                size="lg"
                className="bg-gray-200 text-[#6e61b5] hover:bg-gray-100 px-8 py-6 text-lg rounded-lg"
              >
                <RocketIcon className="ml-2" />
                امروز شروع کنید
              </Button>
            </div>

            {/* Image/Illustration */}
            <div className="flex items-center justify-center">
              <div className="w-auto h-auto">
                <Image 
                  src="/3d-rendering-boy-playing-online.webp" 
                  alt="شروع کسب و کار با تکنولوژی"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

