
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const courses = [
    {
      id: '1',
      title: 'Starting SEO as your Home Based Business',
      instructor: 'Edward Norton',
      price: '30',
      rating: 5,
      reviews: 3,
      duration: '25 days',
      lessons: 7,
      students: 382,
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      level: 'Beginner',
      category: 'Business'
    },
    {
      id: '2',
      title: 'Learning How To Write As A Professional Author',
      instructor: 'Sarah Johnson',
      price: '29',
      rating: 4.8,
      reviews: 40,
      duration: '18 Hours',
      lessons: 7,
      students: 493,
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
      level: 'Beginner',
      category: 'Writing'
    },
    {
      id: '3',
      title: 'The Complete Python Bootcamp From Zero to Hero',
      instructor: 'Michael Chen',
      price: '35',
      rating: 4.9,
      reviews: 120,
      duration: '30 Hours',
      lessons: 7,
      students: 674,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      level: 'Beginner',
      category: 'Programming'
    },
    {
      id: '4',
      title: 'Complete Web Development Course',
      instructor: 'David Miller',
      price: '45',
      rating: 4.7,
      reviews: 85,
      duration: '40 Hours',
      lessons: 12,
      students: 892,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      level: 'Intermediate',
      category: 'Programming'
    },
    {
      id: '5',
      title: 'Digital Marketing Masterclass',
      instructor: 'Lisa Wang',
      price: '28',
      rating: 4.6,
      reviews: 67,
      duration: '20 Hours',
      lessons: 9,
      students: 543,
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
      level: 'Beginner',
      category: 'Marketing'
    },
    {
      id: '6',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Alex Thompson',
      price: '38',
      rating: 4.8,
      reviews: 92,
      duration: '25 Hours',
      lessons: 11,
      students: 721,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      level: 'Beginner',
      category: 'Design'
    }
  ];

  const categories = ['All', 'Business', 'Programming', 'Design', 'Marketing', 'Writing'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-teal-100">Discover courses to boost your skills and advance your career</p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
            Showing {filteredCourses.length} courses
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No courses found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
