import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { useStudentAwards } from '@/hooks/useStudentAwards';
import { AchievementsDisplay } from '@/components/awards';

const WelcomeCard: React.FC = () => {
  const { profile } = useAuth();
  const { tCommon } = useTranslation();
  const { studentAwards, allAwards } = useStudentAwards();

  return (
    <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow p-1" style={{ minHeight: 260 }}>
      {/* Left: Greeting and Awards */}
      <div className="flex-1 min-w-0 p-4 md:p-8">
        <h2 className="text-3xl font-bold mb-4 font-peyda text-gray-800">
          {tCommon('hi')}, {profile ? `${profile.first_name} ${profile.last_name}` : 'Student'}!
        </h2>
        {/* Awards Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">جوایز کسب‌شده</h3>
          <AchievementsDisplay
            allAwards={allAwards}
            studentAwards={studentAwards}
            showTitle={true}
            showPoints={false}
            showOnlyAchieved={true}
          />
        </div>
      </div>
      {/* Right: Bear Illustration */}
      <div className="mt-8 md:mt-0 md:ml-8 flex-shrink-0 flex items-center justify-center">
        <img
          src="/bear-focus.png"
          alt="Bear meditating with coffee"
          className="w-56 h-56 object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default WelcomeCard; 