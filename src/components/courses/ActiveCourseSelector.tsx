import { useEnrolledCoursesQuery } from '@/hooks/queries/useEnrolledCoursesQuery';
import { useAvailableCoursesQuery } from '@/hooks/queries/useAvailableCoursesQuery';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useGoToTraineeCourseDashboard } from '@/lib/navigation';
import CoursesBlock from './CoursesBlock';

const ActiveCourseSelector = () => {
  const { data: enrolledCourses = [], isLoading: enrolledLoading } = useEnrolledCoursesQuery();
  const { data: availableCourses = [], isLoading: availableLoading } = useAvailableCoursesQuery();

  const { trainee: { courseId: currentCourseId } } = useDashboardPanelContext();
  const goToTraineeCourseDashboard = useGoToTraineeCourseDashboard();
  const [showAll, setShowAll] = useState(false);
  
  // Find the current active course from enrolled courses
  const activeCourse = enrolledCourses.find((c: any) => c.id === currentCourseId);

  const onChangeCourse = (id: string) => { 
    goToTraineeCourseDashboard(id);
  }

  const loading = enrolledLoading || availableLoading;

  if (loading) return <div className="py-4 text-center">در حال بارگذاری لیست دوره‌ها...</div>;

  return (
    <>
      {showAll && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 z-30 rounded-[24px] m-2"
          onClick={() => setShowAll(false)}
        />
      )}
      <div
        className="mb-4 absolute left-0 z-30 rounded-b-none rounded-t-none rounded-b-xl w-full flex flex-col items-center transition-all duration-300"
        style={{ top: showAll ? 0 : -220 }}
      >
        <div className="bg-teal-600 rounded-xl p-4 flex gap-4 w-full" style={{ height: 220 }}>
          {/* Enrolled Courses Column */}
          <CoursesBlock
            title="دوره‌های ثبت‌نام شده"
            courses={enrolledCourses}
            onChangeCourse={id => { onChangeCourse(id); setShowAll(false); }}
            isActiveColumn
          />
          {/* Available Courses Column */}
          <CoursesBlock
            title="دوره‌های موجود"
            courses={availableCourses}
            onChangeCourse={id => { onChangeCourse(id); setShowAll(false); }}
          />
        </div>
        <div
          className="flex items-center gap-4 p-0 pr-4 bg-teal-50 rounded-b-xl justify-center inline-flex overflow-hidden transition-all duration-200 cursor-pointer"
          style={{
            height: showAll ? 36 : 24,
          }}
          onMouseEnter={e => {
            if (!showAll) e.currentTarget.style.height = '36px';
          }}
          onMouseLeave={e => {
            if (!showAll) e.currentTarget.style.height = '24px';
          }}
          onClick={() => setShowAll((v) => !v)}
        >
          <span className="text-sm">{activeCourse ? activeCourse.name : 'بدون دوره فعال'}</span>
          <Button
            size="sm"
            variant="default"
            className="rounded-none bg-teal-600 text-teal-50"
          >
            <span className="text-xs">تغییر درس</span>
          </Button>
        </div>
        
      </div>
    </>
  );
};

export default ActiveCourseSelector; 