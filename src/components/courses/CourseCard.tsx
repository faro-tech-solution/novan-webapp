import React from 'react';

interface CourseCardProps {
  course: any;
  isActive: boolean;
  onChangeCourse: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isActive,
  onChangeCourse,
}) => (
  <div
    className={`bg-teal-50 rounded-xl shadow cursor-pointer text-center relative ${isActive ? 'ring-2 ring-teal-500' : ''} group`}
    style={{ width: 160, height: 120, padding: 10, marginTop: 40 }}
    onClick={() => onChangeCourse(course.id)}
  >
    {/* Thumbnail at the top */}
    <div
      className="flex justify-center transition-all duration-200 mt-[-40px] mb-[10px] group-hover:mt-[-50px] group-hover:mb-[20px]"
    >
      <img
        src={course.thumbnail || '/placeholder.svg'}
        alt={course.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
    </div>
    {/* Course title below thumbnail */}
    <div className="font-bold mb-2">{course.name}</div>
    {isActive && (
      <img
        src="/correct.png"
        alt="Active"
        className="absolute top-[-5px] right-[-5px] w-8 h-8"
      />
    )}
  </div>
);

export default CourseCard; 