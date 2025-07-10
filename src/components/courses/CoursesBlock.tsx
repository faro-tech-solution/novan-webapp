import React from 'react';
import CourseCard from './CourseCard';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';

interface CoursesBlockProps {
  title: string;
  courses: any[];
  onChangeCourse: (id: string) => void;
  isActiveColumn?: boolean;
}

const CoursesBlock: React.FC<CoursesBlockProps> = ({
  title,
  courses,
  onChangeCourse,
  isActiveColumn = false,
}) => {
  const { trainee: { courseId: currentCourseId } } = useDashboardPanelContext();
  return (
    <div className="flex-1 flex flex-col bg-teal-500 rounded-[24px] p-2 relative">
      <div className="font-bold text-gray-800 bg-teal-100 inline-block rounded-[10px]" style={{ textAlign: 'center', position: 'absolute', right: 10, top: 10, padding: '0 10px' }}>{title}</div>
      <div className="flex flex-wrap gap-4 justify-center">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              isActive={isActiveColumn && course.id === currentCourseId}
              onChangeCourse={onChangeCourse}
            />
          ))
        ) : (
          <div className="text-teal-100 text-center">هیچ دوره‌ای وجود ندارد</div>
        )}
      </div>
    </div>
  );
};

export default CoursesBlock; 