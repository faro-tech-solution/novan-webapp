
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen, Play, Download, CheckCircle, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CourseDetail = () => {
  const { id } = useParams();

  // Mock course data - in a real app, you'd fetch this based on the ID
  const course = {
    id: '1',
    title: 'Starting SEO as your Home Based Business',
    instructor: 'Edward Norton',
    instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    price: '30',
    rating: 5,
    reviews: 3,
    duration: '15 weeks',
    lessons: 11,
    students: 227,
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
    level: 'Beginner',
    category: 'Business',
    language: 'English',
    certifications: true,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.`,
    whatYouLearn: [
      'Neque sodales ut etiam sit amet est purus non tellus orci ac auctor',
      'Tristique nulla aliquet enim tortor at auctor urna ut amet aliquam et diam molly',
      'Nam libero justo laoreet sit amet, cursus sed vestibulum viverra ex ulae',
      'Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis'
    ]
  };

  const relatedCourses = [
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
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop',
      level: 'Beginner'
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
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      level: 'Beginner'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-teal-600">Course</Link>
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
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-teal-600 font-medium">By {course.instructor}</span>
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
                  <span className="ml-1 text-sm text-gray-600">({course.reviews} Reviews)</span>
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
                  Overview
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  Curriculum
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  Instructor
                </button>
                <button className="py-4 px-1 text-gray-500 hover:text-gray-700">
                  Reviews
                </button>
              </nav>
            </div>

            {/* Course Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
              <div className="prose max-w-none text-gray-600">
                {course.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn?</h2>
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
                  <div className="text-3xl font-bold text-teal-600 mb-2">${course.price}</div>
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white mb-4">
                    Buy Now
                  </Button>
                  <p className="text-sm text-gray-600">Share On:</p>
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
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-red-500">${course.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-semibold">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-semibold">{course.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-semibold">{course.students}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-semibold">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Certifications:</span>
                    <span className="font-semibold text-green-600">
                      {course.certifications ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Courses You May Like</CardTitle>
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
                            By {relatedCourse.instructor}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 ml-1">
                                {relatedCourse.rating}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-teal-600">
                              ${relatedCourse.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
