import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCoursesQuery } from "@/hooks/queries/useCoursesQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const AllCoursesTrainee = () => {
  const { courses, loading, error, refetch } = useCoursesQuery();
  const navigate = useNavigate();

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 min-h-[70vh]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="font-peyda text-2xl text-center">دوره‌های آموزشی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6" />
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl bg-gradient-to-br from-blue-400 to-blue-300 shadow p-0 flex flex-col justify-between h-full relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.03]"
                    onClick={() => navigate(`/trainee/${course.id}/dashboard`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/trainee/${course.id}/dashboard`); }}
                    aria-label={`مشاهده داشبورد دوره ${course.name}`}
                  >
                    {/* Illustration */}
                    <div className="flex justify-center pt-6">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
                        {/* Placeholder illustration: you can replace with an <img src=... /> if you have an image */}
                        <span role="img" aria-label="course" className="text-5xl">👩‍💻</span>
                      </div>
                    </div>
                    {/* Chat bubbles (decorative) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="bg-white/80 rounded-lg px-3 py-1 text-xs text-blue-700 shadow">...</div>
                      <div className="bg-white/80 rounded-lg px-3 py-1 text-xs text-blue-700 shadow">...</div>
                    </div>
                    {/* Course Info */}
                    <div className="flex-1 flex flex-col justify-end px-6 pb-6 pt-4">
                      <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                      <div className="text-blue-100 text-xs mb-4">Create by Course Agency</div>
                      <div className="flex gap-3 mt-2">
                        <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-1 text-xs text-blue-700 font-medium">
                          <span role="img" aria-label="files">📁</span> 17 Files
                        </div>
                        <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-1 text-xs text-blue-700 font-medium">
                          <span role="img" aria-label="duration">⏰</span> 40 min
                        </div>
                      </div>
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