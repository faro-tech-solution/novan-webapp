import Link from 'next/link';

import { Star, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InstructorCard as InstructorCardType } from '@/types/instructor';

const InstructorCard = ({
  id,
  first_name,
  last_name,
  title,
  image,
  rating,
  students,
  courses,
  expertise
}: InstructorCardType) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 text-center">
      <CardContent className="p-6">
        <div className="relative mb-4">
          <img
            src={image}
            alt={`${first_name} ${last_name}`}
            className="w-24 h-24 rounded-full mx-auto object-cover"
          />
        </div>
        
        <Link href={`/instructor/${id}`} className="group">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
            {first_name} {last_name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4">{title}</p>
        
        <div className="flex items-center justify-center mb-4">
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
          <span className="ml-1 text-sm text-gray-600">({rating})</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>{courses} Courses</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{students} Students</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {expertise.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <Link
          href={`/instructor/${id}`}
          className="inline-block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
        >
          View Profile
        </Link>
      </CardContent>
    </Card>
  );
};

export default InstructorCard;
