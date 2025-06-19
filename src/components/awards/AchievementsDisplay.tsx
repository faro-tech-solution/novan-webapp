import { Award, Trophy, Star, Crown, Medal, Target, Zap, Flame } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Award as AwardType } from '@/services/awardsService';
import { StudentAward } from '@/types/student';

interface AchievementsDisplayProps {
  allAwards: AwardType[];
  studentAwards: StudentAward[];
}

const getAwardIcon = (iconName: string, earned: boolean) => {
  const iconProps = {
    className: `h-8 w-8 ${earned ? 'text-yellow-500' : 'text-gray-300'}`,
  };

  switch (iconName.toLowerCase()) {
    case 'award':
      return <Award {...iconProps} />;
    case 'trophy':
      return <Trophy {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    case 'crown':
      return <Crown {...iconProps} />;
    case 'medal':
      return <Medal {...iconProps} />;
    case 'target':
      return <Target {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'flame':
      return <Flame {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'uncommon':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rare':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'epic':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR');
};

export const AchievementsDisplay = ({ allAwards, studentAwards }: AchievementsDisplayProps) => {
  const earnedAwardIds = new Set(studentAwards.map(sa => sa.award_id));

  return (
    <TooltipProvider>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {allAwards.map((award) => {
          const isEarned = earnedAwardIds.has(award.id);
          const studentAward = studentAwards.find(sa => sa.award_id === award.id);

          return (
            <Tooltip key={award.id}>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isEarned 
                      ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="mb-2">
                    {getAwardIcon(award.icon, isEarned)}
                  </div>
                  <p className={`text-xs text-center font-medium ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {award.name}
                  </p>
                  {isEarned && (
                    <Badge className={`${getRarityColor(award.rarity)} text-xs mt-1`}>
                      +{award.points_value}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center">
                  <p className="font-semibold">{award.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className={getRarityColor(award.rarity)}>
                      {award.rarity === 'common' && 'معمولی'}
                      {award.rarity === 'uncommon' && 'غیرمعمول'}
                      {award.rarity === 'rare' && 'نادر'}
                      {award.rarity === 'epic' && 'حماسی'}
                      {award.rarity === 'legendary' && 'افسانه‌ای'}
                    </Badge>
                    <span className="text-sm font-medium text-purple-600">
                      {award.points_value} امتیاز
                    </span>
                  </div>
                  {isEarned && studentAward && (
                    <p className="text-xs text-green-600 mt-1">
                      کسب شده در: {formatDate(studentAward.earned_at)}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-xs text-gray-500 mt-1">
                      هنوز کسب نشده
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
