
import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, Award, TrendingUp, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import InstructorCard from '@/components/InstructorCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  // Fetch courses from database
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .limit(3);
      
      if (error) throw error;
      
      // Transform database courses to match CourseCard interface
      return data?.map((course, index) => ({
        id: course.id,
        title: course.name,
        instructor: course.instructor_name,
        price: '30',
        rating: 4.8 + (index * 0.1),
        reviews: 20 + (index * 10),
        duration: '25 روز',
        lessons: 7,
        students: 300 + (index * 100),
        image: `https://images.unsplash.com/photo-${index === 0 ? '1649972904349-6e44c42644a7' : index === 1 ? '1488590528505-98d2b5aba04b' : '1461749280684-dccba630e2f6'}?w=400&h=300&fit=crop`,
        level: 'مبتدی',
        category: 'برنامه‌نویسی'
      })) || [];
    }
  });

  // Fetch instructors from database
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
    queryKey: ['top-instructors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('instructor_id, instructor_name')
        .eq('status', 'active')
        .limit(4);
      
      if (error) throw error;
      
      // Transform to unique instructors and match InstructorCard interface
      const uniqueInstructors = data?.reduce((acc: any[], course, index) => {
        if (!acc.find(inst => inst.instructor_id === course.instructor_id)) {
          acc.push({
            id: course.instructor_id,
            name: course.instructor_name,
            title: 'متخصص برنامه‌نویسی',
            image: `https://images.unsplash.com/photo-${index === 0 ? '1472099645785-5658abf4ff4e' : index === 1 ? '1494790108755-2616b2e3c3e5' : index === 2 ? '1507003211169-0a1dd7228f2d' : '1438761681033-6461ffad8d80'}?w=150&h=150&fit=crop&crop=face`,
            rating: 4.7 + (index * 0.1),
            students: 800 + (index * 200),
            courses: 8 + (index * 2),
            expertise: ['برنامه‌نویسی', 'طراحی وب', 'علوم داده']
          });
        }
        return acc;
      }, []);
      
      return uniqueInstructors || [];
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                دریافت <span className="text-yellow-300">2500+</span><br />
                بهترین دوره‌های آنلاین<br />
                از پلتفرم آموزشی
              </h1>
              <p className="text-xl mb-8 text-teal-100">
                مهارت‌های جدید را فراگیرید و حرفه خود را با دوره‌های طراحی شده توسط متخصصان برای موفقیت در دنیای واقعی پیش ببرید.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  همین امروز شروع کنید
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                  دوره‌ها را کاوش کنید
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold">2500+</div>
                  <div className="text-sm text-teal-100">دوره آنلاین</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">متخصص</div>
                  <div className="text-sm text-teal-100">مربیان</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">20k+</div>
                  <div className="text-sm text-teal-100">دانشجوی آنلاین</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">مادام‌العمر</div>
                  <div className="text-sm text-teal-100">دسترسی</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                alt="یادگیری آنلاین"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">به بیش از 20000 دانشجوی آنلاین بپیوندید</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn & Grow Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
                alt="یاد بگیرید و رشد کنید"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                مهارت‌های خود را از هر جایی یاد بگیرید و توسعه دهید
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                پلتفرم ما دوره‌های جامعی ارائه می‌دهد که توسط متخصصان صنعت طراحی شده است. با سرعت خود و با دسترسی مادام‌العمر به مواد دوره یاد بگیرید.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">مربیان متخصص از شرکت‌های برتر</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">دسترسی مادام‌العمر به مواد دوره</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">گواهی تکمیل دوره</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">دسترسی از موبایل و دسکتاپ</span>
                </div>
              </div>
              
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
                شروع یادگیری
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">یک دوره انتخاب کنید تا شروع کنید</h2>
            <p className="text-lg text-gray-600">از مجموعه دوره‌های محبوب ما انتخاب کنید</p>
          </div>
          
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">در حال بارگذاری دوره‌ها...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50">
              مشاهده تمام دوره‌ها
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">45.2K</div>
              <div className="text-gray-600">دانشجوی ثبت‌نام شده</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">32.4K</div>
              <div className="text-gray-600">کلاس تکمیل شده</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">354+</div>
              <div className="text-gray-600">مربی برتر</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">99.9%</div>
              <div className="text-gray-600">نرخ رضایت</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Instructors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">مربیان دوره‌ها</h2>
            <p className="text-lg text-gray-600">از متخصصان صنعت و حرفه‌ای‌های با تجربه یاد بگیرید</p>
          </div>
          
          {instructorsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">در حال بارگذاری مربیان...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {instructors.map((instructor) => (
                <InstructorCard key={instructor.id} {...instructor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Get Your Quality Skills Certificate */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-green-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            گواهی مهارت‌های با کیفیت خود را از پلتفرم آموزشی دریافت کنید
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            گواهی‌نامه‌های شناخته شده در صنعت کسب کنید و دستاوردهای خود را به کارفرمایان در سراسر جهان نشان دهید.
          </p>
          <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
            شروع کنید
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
