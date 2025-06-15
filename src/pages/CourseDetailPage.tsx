
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen, Play, Download, CheckCircle, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CourseDetailPage = () => {
  const { id } = useParams();

  // Fetch course data from database
  const { data: course, isLoading } = useQuery({
    queryKey: ['course-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform database course to match interface
      return {
        id: data.id,
        title: data.name,
        instructor: data.instructor_name,
        instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        price: '30',
        rating: 4.8,
        reviews: 25,
        duration: '15 هفته',
        lessons: 11,
        students: 227,
        image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
        level: 'مبتدی',
        category: 'برنامه‌نویسی',
        language: 'فارسی',
        certifications: true,
        description: data.description || `این دوره جامع برای یادگیری مفاهیم پایه و پیشرفته ${data.name} طراحی شده است. در این دوره شما با مفاهیم کلیدی آشنا شده و مهارت‌های عملی مورد نیاز در بازار کار را فرا خواهید گرفت.

دوره شامل پروژه‌های عملی و تمرینات کاربردی است که به شما کمک می‌کند تا مطالب را به صورت عملی درک کنید و آماده ورود به بازار کار شوید.`,
        whatYouLearn: [
          'درک عمیق از مفاهیم پایه و پیشرفته',
          'یادگیری روش‌های بهینه و استانداردهای صنعتی',
          'کار با ابزارها و تکنولوژی‌های مدرن',
          'پیاده‌سازی پروژه‌های عملی و کاربردی'
        ]
      };
    },
    enabled: !!id
  });

  // Fetch related courses
  const { data: relatedCourses = [] } = useQuery({
    queryKey: ['related-courses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .neq('id', id)
        .limit(2);
      
      if (error) throw error;
      
      return data?.map((course, index) => ({
        id: course.id,
        title: course.name,
        instructor: course.instructor_name,
        price: '30',
        rating: 4.8 + (index * 0.1),
        reviews: 40 + (index * 20),
        duration: '18 ساعت',
        lessons: 7,
        students: 493,
        image: `https://images.unsplash.com/photo-${index === 0 ? '1488590528505-98d2b5aba04b' : '1461749280684-dccba630e2f6'}?w=300&h=200&fit=crop`,
        level: 'مبتدی'
      })) || [];
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">در حال بارگذاری جزئیات دوره...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">دوره یافت نشد</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">خانه</Link>
            <span>/</span>
            <Link to="/all-courses" className="hover:text-teal-600">دوره‌ها</Link>
            <span>/</span>
            <span className="text-gray-900">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <img
                    src={course.instructorImage}
                    alt={course.instructor}
                    className="w-8 h-8 rounded-full ml-2"
                  />
                  <span className="text-teal-600 font-medium">توسط {course.instructor}</span>
                </div>
                <Badge variant="secondary">{course.category}</Badge>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(course.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="mr-1 text-sm text-gray-600">({course.reviews} نظر)</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="mb-8">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Course Navigation */}
            <div className="border-b mb-8">
              <nav className="flex space-x-8">
                <button className="py-4 px-1 border-b-2 border-teal-500 text-teal-600 font-medium">
                  نمای کلی
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  برنامه درسی
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  مدرس
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  نظرات
                </button>
              </nav>
            </div>

            {/* Course Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">توضیحات دوره</h2>
              <div className="prose max-w-none text-gray-600">
                {course.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">چه چیزی یاد خواهید گرفت؟</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-teal-600 mb-2">{course.price} تومان</div>
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white mb-4">
                    ثبت نام در دوره
                  </Button>
                  <p className="text-sm text-gray-600">اشتراک‌گذاری:</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button variant="ghost" size="sm">f</Button>
                    <Button variant="ghost" size="sm">t</Button>
                    <Button variant="ghost" size="sm">in</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">قیمت:</span>
                    <span className="font-semibold text-red-500">{course.price} تومان</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">مدرس:</span>
                    <span className="font-semibold">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">مدت زمان:</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">درس‌ها:</span>
                    <span className="font-semibold">{course.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">دانشجویان:</span>
                    <span className="font-semibold">{course.students}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">زبان:</span>
                    <span className="font-semibold">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">گواهی:</span>
                    <span className="font-semibold text-green-600">
                      {course.certifications ? 'بله' : 'خیر'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>دوره‌هایی که ممکن است دوست داشته باشید</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedCourses.map((relatedCourse) => (
                      <Link
                        key={relatedCourse.id}
                        to={`/course/${relatedCourse.id}`}
                        className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex gap-3">
                          <img
                            src={relatedCourse.image}
                            alt={relatedCourse.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">
                              {relatedCourse.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                              توسط {relatedCourse.instructor}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600 mr-1">
                                  {relatedCourse.rating}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-teal-600">
                                {relatedCourse.price} تومان
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;
