import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGoToTraineeCourseDashboard } from '@/lib/navigation';

const ActiveCourseSelector = () => {
  const { courses, loading } = useCoursesQuery();

  const { trainee: { courseId: currentCourseId } } = useDashboardPanelContext();
  const goToTraineeCourseDashboard = useGoToTraineeCourseDashboard();
  const [showAll, setShowAll] = useState(false);
  const filteredCourses = courses.filter((c: any) => c.status === 'active');
  const activeCourse = filteredCourses.find((c: any) => c.id === currentCourseId);

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
        className="mb-4 absolute left-0 z-30 rounded-b-xl w-full flex flex-col items-center transition-all duration-300"
        style={{ top: showAll ? 0 : -200 }}
      >
        <div className="bg-teal-600 rounded-xl p-4 flex flex-wrap gap-4 w-full" style={{ height: 200 }}>
          {filteredCourses.map((course: any) => (
            <div
              key={course.id}
              className={`bg-white rounded-xl shadow p-4 cursor-pointer min-w-[160px] text-center ${course.id === currentCourseId ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => { onChangeCourse(course.id); setShowAll(false); }}
            >
              <div className="font-bold mb-2">{course.name}</div>
              <div className="text-xs text-gray-500">{course.description || ''}</div>
              {course.id === currentCourseId && <div className="mt-2 text-green-600 font-bold">فعال</div>}
            </div>
          ))}
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