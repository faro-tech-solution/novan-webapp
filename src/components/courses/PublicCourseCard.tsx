import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicCourse } from '@/types/course';
import { Tag, User } from 'lucide-react';

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

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-64 md:flex-shrink-0">
            <div className="w-full h-48 md:h-full overflow-hidden">
              {course.thumbnail ? (
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
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
          </div>

          <div className="flex flex-col flex-1">
            <CardHeader className="space-y-2 p-4 px-6">
              <CardTitle className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                {course.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <p className="text-base font-medium text-gray-600">
                      {formatPrice(course.price)}
                    </p>
                  </div>
                  {course.instructor_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{course.instructor_name}</span>
                    </div>
                  )}
                </div>
                {course.description && (
                  <CardDescription className="text-sm leading-relaxed text-gray-600">
                    {course.description}
                  </CardDescription>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PublicCourseCard;


