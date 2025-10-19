import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { RocketIcon, HandshakeIcon } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image/Illustration */}
          <div className="relative">
            <Image 
              src="/hamid-tadayon.png" 
              alt="Hamid Tadayon"
              width={800}
              height={800}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Right Column - Text Content */}
          <div className="text-right space-y-8">
            <h1 className="text-3xl sm:text-3xl lg:text-3xl font-bold text-gray-900 leading-tight">
              یادگیری مهارت‌های آینده
              <span className="text-xl block text-blue-600 mt-2 font-normal">ساده‌تر از آن چیزی است که فکر می‌کنید</span>
            </h1>
            
            <p className="text-gray-600 leading-relaxed">
              آموزش تخصصی برای هر کسی که می‌خواهد در دنیای دیجیتال پیشرفت کند. 
              مسیر درستی را برای یادگیری انتخاب کنید و با ما همراه باشید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/portal/register">
                <Button 
                  size="lg"
                  className="border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl group"
                >
                  <RocketIcon className="ml-2 group-hover:translate-x-1 transition-transform" />
                  شروع یادگیری
                </Button>
              </Link>
              <Link href="/portal/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 group"
                >
                  <HandshakeIcon className="ml-2" />
                  درخواست مشاوره
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

