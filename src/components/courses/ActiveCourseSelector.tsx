import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useGoToTraineeCourseDashboard } from '@/lib/navigation';
import CoursesBlock from './CoursesBlock';

const ActiveCourseSelector = () => {
  const { courses, loading } = useCoursesQuery();

  const { trainee: { courseId: currentCourseId } } = useDashboardPanelContext();
  const goToTraineeCourseDashboard = useGoToTraineeCourseDashboard();
  const [showAll, setShowAll] = useState(false);
  const activeCourses = courses.filter((c: any) => c.status === 'active');
  const otherCourses = courses.filter((c: any) => c.status !== 'active');
  const activeCourse = [...activeCourses, ...otherCourses].find((c: any) => c.id === currentCourseId);

  const onChangeCourse = (id: string) => { 
    goToTraineeCourseDashboard(id);
  }

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
          {/* Active Courses Column */}
          <CoursesBlock
            title="دوره‌های فعال"
            courses={activeCourses}
            onChangeCourse={id => { onChangeCourse(id); setShowAll(false); }}
            isActiveColumn
          />
          {/* Other Courses Column */}
          <CoursesBlock
            title="پیشنهاد دوره"
            courses={otherCourses}
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