
import { Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  price: string;
  rating: number;
  reviews: number;
  duration: string;
  lessons: number;
  students: number;
  image: string;
  level: string;
  category: string;
}

const CourseCard = ({
  id,
  title,
  instructor,
  price,
  rating,
  reviews,
  duration,
  lessons,
  students,
  image,
  level,
  category
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader className="p-0 relative">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-4 left-4 bg-yellow-400 text-black">
            {duration}
          </Badge>
          <Badge 
            className={`absolute top-4 right-4 ${
              level === 'Beginner' ? 'bg-green-500' : 
              level === 'Intermediate' ? 'bg-blue-500' : 'bg-purple-500'
            }`}
          >
            {level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-3">
          <span className="text-sm text-teal-600 font-medium">{category}</span>
        </div>
        
        <Link to={`/course/${id}`} className="group">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4">By {instructor}</p>
        
        <div className="flex items-center mb-4 space-x-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">({reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>{lessons} Lessons</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{students} Students</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-teal-600">${price}</span>
          <Link
            to={`/course/${id}`}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            Enroll Now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
