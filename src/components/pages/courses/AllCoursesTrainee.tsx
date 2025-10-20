import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useStudentCoursesQuery } from "@/hooks/queries/useStudentCoursesQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoToTraineeCourseDashboard } from '@/lib/navigation';

const AllCoursesTrainee = () => {
  const { data: courses = [], isLoading, error, refetch } = useStudentCoursesQuery();
  const goToTraineeCourseDashboard = useGoToTraineeCourseDashboard();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 min-h-[70vh]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="font-yekanbakh text-2xl text-center">دوره‌های آموزشی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6" />
            {filteredCourses.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  هیچ دوره‌ای یافت نشد.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    refetch();
                  }}
                  className="mt-4"
                >
                  تلاش مجدد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AllCoursesTrainee; 