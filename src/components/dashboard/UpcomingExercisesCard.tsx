import { BookOpen } from 'lucide-react';
import Link from 'next/link';

import { UpcomingExercise } from '@/types/exercise';
import { useAuth } from '@/contexts/AuthContext';

interface UpcomingExercisesCardProps {
  exercises: UpcomingExercise[];
  className?: string;
}

const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty) {
    case 'آسان':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <BookOpen className="h-4 w-4 text-green-400" />,
      };
    case 'متوسط':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <BookOpen className="h-4 w-4 text-yellow-400" />,
      };
    case 'سخت':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <BookOpen className="h-4 w-4 text-red-400" />,
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <BookOpen className="h-4 w-4 text-gray-400" />,
      };
  }
};

export const UpcomingExercisesCard = ({ exercises, className = '' }: UpcomingExercisesCardProps) => {
  const { profile } = useAuth();
  const role = profile?.role || 'trainee';

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="mb-3">
          <h3 className="text-base font-medium">تمرین‌های پیش رو</h3>
        </div>
        {exercises.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            تمرین جدیدی برای انجام وجود ندارد
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {exercises.map((exercise) => {
              const { bg, text, icon } = getDifficultyStyles(exercise.difficulty);
              return (
                <Link
                  href={`/${role}/exercise/${exercise.id}`}
                  key={exercise.id}
                  className={`flex items-center rounded-xl px-3 py-2 ${bg} ${text} shadow-sm transition hover:scale-[1.02] hover:shadow-md focus:outline-none text-sm`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex-shrink-0 ml-2 flex items-center justify-center">{icon}</div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="truncate leading-tight text-sm">{exercise.title}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
