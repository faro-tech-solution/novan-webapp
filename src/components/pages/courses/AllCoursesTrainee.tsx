import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useStudentCoursesQuery } from "@/hooks/queries/useStudentCoursesQuery";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGoToTraineeCourseDashboard } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import { fetchPublicCourses } from '@/services/courseService';
import { useState, useEffect } from 'react';
import { PublicCourse } from '@/types/course';

const AllCoursesTrainee = () => {
  const { data: courses = [], isLoading, error, refetch } = useStudentCoursesQuery();
  const goToTraineeCourseDashboard = useGoToTraineeCourseDashboard();
  const router = useRouter();
  
  // State for all available courses
  const [allCourses, setAllCourses] = useState<PublicCourse[]>([]);
  const [isLoadingAllCourses, setIsLoadingAllCourses] = useState(false);
  const [allCoursesError, setAllCoursesError] = useState<string | null>(null);
  
  // Fetch all available courses
  useEffect(() => {
    const loadAllCourses = async () => {
      try {
        setIsLoadingAllCourses(true);
        setAllCoursesError(null);
        const data = await fetchPublicCourses();
        setAllCourses(data);
      } catch (err) {
        console.error('Error loading all courses:', err);
        setAllCoursesError('خطا در بارگذاری لیست دوره‌ها');
      } finally {
        setIsLoadingAllCourses(false);
      }
    };

    loadAllCourses();
  }, []);

  console.log({courses})
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری لیست دوره‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">خطا در دریافت لیست دوره‌ها</p>
          <Button onClick={() => refetch()}>تلاش مجدد</Button>
        </div>
      </div>
    );
  }

  const filteredCourses = courses.filter((c: any) => c.status === 'active');
  
  // Get enrolled course IDs
  const enrolledCourseIds = filteredCourses.map((course: any) => course.id);
  
  // Filter available courses (not enrolled)
  const availableCourses = allCourses.filter(course => 
    !enrolledCourseIds.includes(course.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Enrolled Courses Section */}
        <div className="max-w-4xl mx-auto">
          {filteredCourses.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <h3 className="text-2xl font-bold text-gray-900 text-center">دوره‌های آموزشی شما</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl bg-gray-100 shadow p-0 flex flex-col justify-between h-full relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.03]"
                      onClick={() => goToTraineeCourseDashboard(course.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToTraineeCourseDashboard(course.id); }}
                      aria-label={`مشاهده داشبورد دوره ${course.title}`}
                    >
                      {/* Thumbnail */}
                      <div className="w-full h-40">
                        <img
                          src={course.thumbnail || '/placeholder.svg'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Course Info */}
                      <div className="flex-1 flex flex-col justify-end px-6 pb-6 pt-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                        <div className="text-gray-600 text-xs mb-4">مدرس: {course.instructor || 'نامشخص'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Courses Section */}
          {availableCourses.length > 0 && (
            <div>
              {isLoadingAllCourses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">در حال بارگذاری دوره‌ها...</p>
                </div>
              ) : allCoursesError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{allCoursesError}</p>
                  <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
                </div>
              ) : (
                 <div className="grid gap-6">
                   {availableCourses.map((course) => (
                     <div
                       key={course.id}
                       className="w-1/2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex cursor-pointer"
                       onClick={() => router.push(`/courses/${course.slug}`)}
                     >
                      {/* Course Thumbnail - Right Side */}
                      <div className="w-24 h-24">
                         <img
                           src={course.thumbnail || '/placeholder.svg'}
                           alt={course.name}
                           className="w-full h-full object-cover rounded-r-lg"
                         />
                       </div>

                       {/* Course Info - Left Side */}
                       <div className="flex-1 py-2 px-4 flex flex-col justify-between">
                         <div>
                           <h4 className="font-semibold text-gray-900 text-lg">{course.name}</h4>
                         </div>
                         <div className="mt-3">
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => router.push(`/courses/${course.slug}`)}
                             className="text-green-600 hover:text-green-700 hover:bg-green-50"
                           >
                             &gt; مشاهده جزئیات
                           </Button>
                         </div>
                       </div>
                       
                       
                     </div>
                   ))}
                 </div>
              )}
            </div>
          )}

          {/* Empty State - No enrolled courses */}
          {filteredCourses.length === 0 && availableCourses.length === 0 && !isLoadingAllCourses && (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mb-6">
                    <svg 
                      className="w-16 h-16 mx-auto text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-2">
                    شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    لطفاً لیست دوره‌ها را بررسی کنید.
                  </p>
                  <Button
                    onClick={() => {
                      router.push('/courses');
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    مشاهده لیست دوره‌ها
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllCoursesTrainee; 