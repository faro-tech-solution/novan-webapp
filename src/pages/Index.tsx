
import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, Award, TrendingUp, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import InstructorCard from '@/components/InstructorCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const featuredCourses = [
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
    }
  ];

  const topInstructors = [
    {
      id: '1',
      name: 'Edward Norton',
      title: 'SEO Specialist',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      students: 1245,
      courses: 12,
      expertise: ['SEO', 'Digital Marketing', 'Content Strategy']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'Content Writer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b2e3c3e5?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      students: 890,
      courses: 8,
      expertise: ['Writing', 'Copywriting', 'Storytelling']
    },
    {
      id: '3',
      name: 'Michael Chen',
      title: 'Senior Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      students: 2340,
      courses: 15,
      expertise: ['Python', 'Web Development', 'Data Science']
    },
    {
      id: '4',
      name: 'Lisa Wong',
      title: 'UX Designer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      students: 1567,
      courses: 10,
      expertise: ['UI/UX', 'Design Thinking', 'Prototyping']
    }
  ];

  const categories = [
    { name: 'Business', color: 'bg-blue-100 text-blue-700', count: '12 Courses' },
    { name: 'Design', color: 'bg-pink-100 text-pink-700', count: '8 Courses' },
    { name: 'Development', color: 'bg-green-100 text-green-700', count: '15 Courses' },
    { name: 'Marketing', color: 'bg-yellow-100 text-yellow-700', count: '6 Courses' },
    { name: 'Music', color: 'bg-purple-100 text-purple-700', count: '4 Courses' },
    { name: 'Photography', color: 'bg-red-100 text-red-700', count: '7 Courses' },
    { name: 'Technology', color: 'bg-indigo-100 text-indigo-700', count: '11 Courses' },
    { name: 'Writing', color: 'bg-orange-100 text-orange-700', count: '5 Courses' },
    { name: 'Lifestyle', color: 'bg-teal-100 text-teal-700', count: '9 Courses' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Get <span className="text-yellow-300">2500+</span><br />
                Best Online Courses<br />
                From TutorialHub
              </h1>
              <p className="text-xl mb-8 text-teal-100">
                Master new skills and advance your career with expert-led courses designed for real-world success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  Start Learning Today
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                  Explore Courses
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold">2500+</div>
                  <div className="text-sm text-teal-100">Online Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Expert</div>
                  <div className="text-sm text-teal-100">Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">20k+</div>
                  <div className="text-sm text-teal-100">Online Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Lifetime</div>
                  <div className="text-sm text-teal-100">Access</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                alt="Online Learning"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Join 20,000+ students learning online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Categories</h2>
            <p className="text-lg text-gray-600">Browse our most popular course categories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/courses?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
                alt="Learn and Grow"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Learn & Grow Your Skills From Anywhere
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our platform offers comprehensive courses designed by industry experts. Learn at your own pace with lifetime access to course materials.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">Expert instructors from top companies</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">Lifetime access to course materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                  <span className="text-gray-700">Mobile and desktop access</span>
                </div>
              </div>
              
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pick A Course To Get Started</h2>
            <p className="text-lg text-gray-600">Choose from our selection of popular courses</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50">
              View All Courses
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
              <div className="text-gray-600">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">32.4K</div>
              <div className="text-gray-600">Class Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">354+</div>
              <div className="text-gray-600">Top Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">99.9%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Instructors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Instructors</h2>
            <p className="text-lg text-gray-600">Learn from industry experts and experienced professionals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topInstructors.map((instructor) => (
              <InstructorCard key={instructor.id} {...instructor} />
            ))}
          </div>
        </div>
      </section>

      {/* Get Your Quality Skills Certificate */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-green-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Get Your Quality Skills Certificate Through TutorialHub
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Earn industry-recognized certificates and showcase your achievements to employers worldwide.
          </p>
          <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
            Get Started
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
