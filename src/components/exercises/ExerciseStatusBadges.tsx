
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { translateDifficultyToDisplay } from '@/utils/difficultyTranslation';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100 transition-colors">فعال</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-800 hover:text-blue-100 transition-colors">تکمیل شده</Badge>;
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-800 hover:text-gray-100 transition-colors">پیش‌نویس</Badge>;
    default:
      return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{status}</Badge>;
  }
};

export const getExerciseStatusBadge = (exerciseStatus: string) => {
  switch (exerciseStatus) {
    case 'upcoming':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-800 hover:text-blue-100 transition-colors">آینده</Badge>;
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100 transition-colors">در حال انجام</Badge>;
    case 'overdue':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-800 hover:text-red-100 transition-colors">
          <AlertTriangle className="h-3 w-3 mr-1" />
          عقب‌افتاده
        </Badge>
      );
    case 'closed':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-800 hover:text-gray-100 transition-colors">بسته</Badge>;
    default:
      return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{exerciseStatus}</Badge>;
  }
};

export const getDifficultyBadge = (difficulty: string | null) => {
  const displayText = translateDifficultyToDisplay(difficulty);
  
  if (!difficulty) {
    return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{displayText}</Badge>;
  }
  
  switch (difficulty) {
    case 'easy':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100 transition-colors">{displayText}</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-800 hover:text-yellow-100 transition-colors">{displayText}</Badge>;
    case 'hard':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-800 hover:text-red-100 transition-colors">{displayText}</Badge>;
    default:
      return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{displayText}</Badge>;
  }
};
