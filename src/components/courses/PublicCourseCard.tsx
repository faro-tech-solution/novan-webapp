import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicCourse } from '@/types/course';
import { Calendar, User } from 'lucide-react';

interface PublicCourseCardProps {
  course: PublicCourse;
}

const PublicCourseCard = ({ course }: PublicCourseCardProps) => {
  const formatPrice = (price?: number) => {
    if (!price || price === 0) {
      return 'رایگان';
    }
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const isFree = !course.price || course.price === 0;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <div className="relative">
          <div className="w-full h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              className={
                isFree
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }
            >
              {formatPrice(course.price)}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.name}
          </CardTitle>
          {course.description && (
            <CardDescription className="line-clamp-2 text-sm">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {course.instructor_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{course.instructor_name}</span>
              </div>
            )}
            {course.start_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>شروع: {formatDate(course.start_date)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PublicCourseCard;


