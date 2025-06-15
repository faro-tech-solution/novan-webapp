
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AllCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');

  // Fetch all courses from database
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
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
        image: `https://images.unsplash.com/photo-${index % 3 === 0 ? '1649972904349-6e44c42644a7' : index % 3 === 1 ? '1488590528505-98d2b5aba04b' : '1461749280684-dccba630e2f6'}?w=400&h=300&fit=crop`,
        level: 'مبتدی',
        category: 'برنامه‌نویسی'
      })) || [];
    }
  });

  const categories = ['همه', 'برنامه‌نویسی', 'طراحی وب', 'علوم داده', 'هوش مصنوعی', 'موبایل'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'همه' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">تمام دوره‌ها</h1>
          <p className="text-xl text-teal-100">دوره‌هایی را کشف کنید که مهارت‌های شما را تقویت کرده و حرفه‌تان را پیش ببرند</p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="جستجوی دوره‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-teal-500 hover:bg-teal-600" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-gray-600">
            نمایش {filteredCourses.length} دوره
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">در حال بارگذاری دوره‌ها...</div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">هیچ دوره‌ای با معیارهای شما یافت نشد.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('همه');
                }}
                className="mt-4"
              >
                پاک کردن فیلترها
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllCourses;
