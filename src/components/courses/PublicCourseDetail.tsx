'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicCourse, CourseIntroVideo } from '@/types/course';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  BookOpen, 
  Headphones, 
  Key, 
  PlayCircle,
  GraduationCap,
  Bot,
  Rocket,
  HandHelping,
  Briefcase,
  ChevronDown,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseEnrollmentCTA from './CourseEnrollmentCTA';

interface PublicCourseDetailProps {
  course: PublicCourse;
}

const PublicCourseDetail = ({ course }: PublicCourseDetailProps) => {
  const [selectedVideo, setSelectedVideo] = useState<CourseIntroVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const handleVideoClick = (video: CourseIntroVideo) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const previewData = course.preview_data;

  // Mock data for demonstration - in production, these would come from the database
  const features = [
    { icon: BookOpen, title: 'آموزش مهارت محور و عملی' },
    { icon: Headphones, title: 'پشتیبانی آنلاین' },
    { icon: Key, title: 'دسترسی دائمی به ویدئوها' }
  ];

  const differentiators = [
    {
      icon: GraduationCap,
      title: 'یادگیری از صفر تا برنامه نویس حرفه‌ای',
      description: 'ما شما را از نقطه‌ای که هیچ چیز از برنامه نویسی نمی‌دانید، گام به گام تا جایی پیش می‌بریم که یک برنامه‌نویس حرفه‌ای شوید.'
    },
    {
      icon: Bot,
      title: 'ترکیب برنامه نویسی + هوش مصنوعی',
      description: 'به شما یاد می‌دهیم که چگونه از هوش مصنوعی به عنوان یک دستیار کدنویس قدرتمند استفاده کنید و بهره‌وری خود را چندین برابر کنید.'
    },
    {
      icon: Rocket,
      title: 'رویکرد پروژه‌محور و تجربه عملی',
      description: 'تمام سرفصل‌ها و تمرینات حول پروژه بزرگ و واقعی متمرکز شده‌اند. در پایان، شما دو پروژه کامل و حرفه‌ای وب سایت و وب اپلیکیشن خواهید داشت.'
    },
    {
      icon: HandHelping,
      title: 'پشتیبانی بی‌نظیر و منتورینگ اختصاصی',
      description: 'در طول دوره ما با تیمی از مربیان باتجربه، همواره در کنار شما خواهیم بود تا به سوالاتتان پاسخ دهیم و مشکلاتتان را رفع کنیم.'
    },
    {
      icon: Briefcase,
      title: 'آمادگی برای ورود به بازار کار و جذب سرمایه',
      description: 'با رزومه قوی و نمونه کارهای واقعی، به شما در یافتن شغل مناسب کمک کرده و حتی در جذب سرمایه‌گذار برای ایده‌هایتان یاری می‌رسانیم.'
    },
    {
      icon: Star,
      title: 'تضمین رضایت و بازگشت وجه',
      description: 'ما به کیفیت دوره و اثربخشی آن اطمینان داریم. اگر پس از گذراندن نیمی از دوره، از محتوا و روش تدریس رضایت نداشتید، مبلغ شما را بدون هیچ سوالی بازمی‌گردانیم.'
    }
  ];

  const faqs = [
    { question: 'آیا این دوره پیش‌نیاز دارد؟', answer: 'خیر. این دوره از پایه آموزش داده می‌شود و مناسب همه سطوح است. ما از مفاهیم مقدماتی تا پیشرفته را قدم‌به‌قدم آموزش می‌دهیم.' },
    { question: 'آیا به آپدیت‌های دوره دسترسی خواهم داشت؟', answer: 'بله. تمامی شرکت‌کنندگان به آپدیت‌های آینده به صورت رایگان دسترسی خواهند داشت.' },
    { question: 'پشتیبانی چگونه است؟', answer: 'در طول دوره و حتی بعد از آن، برای پروژه‌ها و مصاحبه در کنار شما هستیم.' },
    { question: 'آیا این دوره ضبط شده است؟', answer: 'بله، جلسات آموزشی کامل با کیفیت HD ضبط شده و شما بعد از پرداخت به تمامی جلسات دسترسی خواهید داشت.' }
  ];

  const testimonials = [
    {
      name: 'مرضیه غلامی',
      rating: 5,
      text: 'می‌خواهم صمیمانه از مجموعه فاروباکس و استاد تدینی تشکر کنم. دوره‌ای کامل و کاربردی، از صفر تا توسعه کامل وب سایت. بیان روان و ساده استاد، یادگیری رو عمیق و لذت‌بخش کرد.'
    },
    {
      name: 'مهدی خیرخواه',
      rating: 5,
      text: 'دوره «برنامه‌نویسی مدرن» برام چیزی فراتر از یک دوره آموزشی بود. من همیشه از برنامه‌نویسی می‌ترسیدم! ولی نحوه آموزش استاد انقدر روان و قابل فهم بود که نه‌تنها ترسم ریخت، بلکه واقعاً به یادگیری علاقه‌مند شدم.'
    },
    {
      name: 'سنا خاقانی',
      rating: 5,
      text: 'این دوره دقیقاً همون چیزی بود که لازم داشتم. همه‌چیز با نظم و از پایه توضیح داده شده بود، بدون اینکه حس کنی جا موندی. به‌نظرم نقطه قوت اصلی این دوره، نحوه تدریس استاد تدینی بود.'
    }
  ];

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
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Title and Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" dir="rtl">
                {course.name}
              </h1>
              {course.description && (
                <div className="text-gray-700 leading-relaxed" dir="rtl">
                  <p>{course.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price and CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <CourseEnrollmentCTA course={course} />
            </div>
          </div>
        </div>

            {/* Course Image */}
        <div className="mb-8">
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
        </div>

        {/* Feature Boxes */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              dir="rtl"
            >
              <div className="bg-blue-50 p-3 rounded-full">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  </div>
          ))}
                  </div>

        {/* Course Description */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="space-y-12">
                {/* Intro Section */}
                <section className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900 relative inline-block">
                    <span className="relative">
                      برنامه نویسی مدرن: آینده‌ای که همین امروز آغاز می‌شود!
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
                  <p className="text-gray-700 max-w-4xl mx-auto leading-relaxed" dir="rtl">
                    آیا تا به حال به این فکر کرده‌اید که چگونه می‌توانید ایده‌های ناب خود را به وب‌سایت‌های پویا و وب اپلیکیشن‌های کاربردی تبدیل کنید؟ اگر پاسخ شما مثبت است، دقیقاً در جای درستی قرار دارید!
                  </p>
                </section>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg rounded-full">
                    ثبت‌نام در دوره و شروع مسیر حرفه‌ای خود!
                  </Button>
        </div>

                {/* Why Now Section */}
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 text-center relative inline-block w-full">
                    <span className="relative inline-block">
                      چرا اکنون زمان ورود به دنیای برنامه نویسی با هوش مصنوعی است؟
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
          {previewData?.description && (
                    <div className="text-gray-700 leading-relaxed max-w-4xl mx-auto text-center" dir="rtl">
                      <p className="whitespace-pre-line">{previewData.description}</p>
                    </div>
                  )}
                </section>

                {/* Video Introduction */}
                {previewData?.intro_videos && previewData.intro_videos.length > 0 && (
                  <section className="bg-gray-50 rounded-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center relative inline-block w-full">
                      <span className="relative inline-block">
                        ویدئوی معرفی دوره
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previewData.intro_videos.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => handleVideoClick(video)}
                          className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                    >
                          <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                                <PlayCircle className="w-20 h-20 text-blue-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                              <PlayCircle className="w-20 h-20 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 line-clamp-2" dir="rtl">
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
                  </section>
                )}

                {/* What You'll Learn */}
                {previewData?.topics && previewData.topics.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center relative inline-block w-full">
                      <span className="relative inline-block">
                        در این دوره چه چیزی یاد می‌گیریم؟
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                      </span>
                    </h2>
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                      <ul className="space-y-4" dir="rtl">
                        {previewData.topics.map((topic, index) => (
                          <li key={index} className="flex items-start gap-4 text-gray-700">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                              <ChevronLeft className="w-4 h-4 text-blue-600 rotate-180" />
                            </div>
                            <span className="flex-1 leading-relaxed text-lg">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* About Mentor */}
                {course.instructor_name && (
                  <section id="mentor" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8 relative inline-block w-full">
                      <span className="relative inline-block">
                        سخنی با شما از زبان مربی دوره
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                      </span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="flex justify-center">
                        <div className="w-64 h-64 rounded-full overflow-hidden bg-gray-200 shadow-lg">
                          {/* Placeholder for instructor image */}
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
                            <GraduationCap className="w-32 h-32 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4" dir="rtl">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          من <span className="text-blue-600 font-semibold">{course.instructor_name}</span>، به عنوان مربی شما با بیش از <span className="text-blue-600 font-semibold">۱۵ سال تجربه عملی</span> در حوزه برنامه نویسی، هوش مصنوعی و توسعه استارتاپ‌ها در <span className="text-blue-600 font-semibold">پروژه‌های بین المللی</span>، اینجا هستم تا تمام تجربیات و دانش خود را با شما به اشتراک بگذارم.
                        </p>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          هدف من این است که شما نه تنها یک کدنویس، بلکه یک <span className="text-red-600 font-semibold">مهندس نرم‌افزار خلاق و چابک</span> شوید که می‌تواند از پتانسیل کامل فناوری‌های روز برای خلق ارزش استفاده کند.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Why Different */}
                <section className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 text-center relative inline-block w-full">
                    <span className="relative inline-block">
                      چه چیزی دوره را از سایر دوره‌ها متمایز می‌کند؟
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {differentiators.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4" dir="rtl">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-full flex-shrink-0">
                            <item.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Who Is This For */}
                <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 text-center mb-6 relative inline-block w-full">
                    <span className="relative inline-block">
                      دوره "برنامه نویسی مدرن" برای چه کسانی طراحی شده است؟
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed max-w-4xl mx-auto" dir="rtl">
                    <p>این دوره یک مسیر جامع و کامل <span className="text-blue-600 font-semibold">از صفر تا صد برنامه نویسی</span> را برای شما ترسیم می‌کند. مهم نیست در چه سطحی از دانش قرار دارید؛ ما شما را از همان نقطه همراهی خواهیم کرد.</p>
                <ul className="space-y-3">
                      <li><span className="text-blue-600 font-semibold">اگر هیچ تجربه‌ای در برنامه نویسی ندارید:</span> این دوره دقیقاً برای شماست!</li>
                      <li><span className="text-blue-600 font-semibold">اگر کمی با برنامه نویسی آشنا هستید:</span> این دوره به شما کمک می‌کند تا دانش خود را ساختارمند کنید.</li>
                      <li><span className="text-blue-600 font-semibold">اگر برنامه نویس حرفه‌ای هستید:</span> وارد عصر جدید برنامه نویسی با هوش مصنوعی شوید.</li>
                    </ul>
                  </div>
                </section>

                {/* FAQ Section */}
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 text-center relative inline-block w-full">
                    <span className="relative inline-block">
                      پاسخ به سوالات پر تکرار
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
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

                {/* Testimonials */}
                <section id="customer" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 relative inline-block">
                      <span className="relative">
                        نظرات دانشجویان دوره
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm">نظرات دانشجویان در رابطه با دوره برنامه نویسی مدرن</p>
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

                {/* Pricing Section */}
                <section className="bg-white rounded-lg p-8 shadow-sm">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center relative inline-block w-full">
                    <span className="relative inline-block">
                      قیمت و شرایط خرید
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4" dir="rtl">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <ChevronLeft className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
                          <span className="text-gray-700">دسترسی مادام العمر</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ChevronLeft className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
                          <span className="text-gray-700">تضمین بازگشت وجه در صورت نارضایتی</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ChevronLeft className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
                          <span className="text-gray-700">پشتیبانی یک ساله</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ChevronLeft className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
                          <span className="text-gray-700">دسترسی رایگان به تمامی آپدیتها</span>
                    </li>
                      </ul>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-gray-500 line-through text-xl">۱۵,۰۰۰,۰۰۰ تومان</p>
                        <p className="text-4xl font-bold text-blue-600">۱۲,۰۰۰,۰۰۰ تومان</p>
                      </div>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full w-full">
                        ثبت نام و شرکت در دوره
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Final CTA Banner */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    آینده‌ای درخشان در دنیای برنامه نویسی در انتظار شماست!
                  </h2>
                  <p className="text-lg mb-8 max-w-3xl mx-auto" dir="rtl">
                    برای شروع این مسیر هیجان‌انگیز، کافیست بر روی دکمه <span className="text-yellow-300 font-semibold">"ثبت‌نام در دوره"</span> کلیک کنید و مراحل ثبت‌نام را تکمیل نمایید.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-lg rounded-full font-bold"
                  >
                    ثبت‌نام در دوره و شروع مسیر حرفه‌ای خود!
                  </Button>
                  <p className="mt-6 text-sm">
                    همین امروز اولین قدم را برای تبدیل شدن به یک برنامه نویس حرفه‌ای بردارید.
                  </p>
                </section>
              </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" dir="rtl">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedVideo?.url && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={selectedVideo.url}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
            )}
            {selectedVideo?.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm leading-relaxed" dir="rtl">
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicCourseDetail;


