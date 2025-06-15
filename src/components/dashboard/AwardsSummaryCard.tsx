
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Crown } from 'lucide-react';
import { StudentAward } from '@/services/awardsService';

interface AwardsSummaryCardProps {
  studentAwards: StudentAward[];
  loading?: boolean;
}

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return <Award className="h-3 w-3" />;
    case 'uncommon':
      return <Trophy className="h-3 w-3" />;
    case 'rare':
      return <Star className="h-3 w-3" />;
    case 'epic':
      return <Crown className="h-3 w-3" />;
    case 'legendary':
      return <Crown className="h-3 w-3 text-yellow-600" />;
    default:
      return <Award className="h-3 w-3" />;
  }
};

export const AwardsSummaryCard = ({ studentAwards, loading }: AwardsSummaryCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">جوایز اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentAwards = studentAwards.slice(0, 3);
  const totalBonusPoints = studentAwards.reduce((sum, award) => sum + award.bonus_points, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">جوایز اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        {recentAwards.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">هنوز جایزه‌ای ندارید</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAwards.map((studentAward) => (
              <div key={studentAward.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getRarityIcon(studentAward.awards.rarity)}
                  <span className="text-sm font-medium truncate">
                    {studentAward.awards.name}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{studentAward.bonus_points}
                </Badge>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">مجموع جوایز:</span>
                <span className="font-medium">{studentAwards.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">امتیاز اضافی:</span>
                <span className="font-medium text-purple-600">+{totalBonusPoints}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
