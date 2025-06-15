
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800">تکمیل شده</Badge>;
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800">پیش‌نویس</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getExerciseStatusBadge = (exerciseStatus: string) => {
  switch (exerciseStatus) {
    case 'upcoming':
      return <Badge className="bg-blue-100 text-blue-800">آینده</Badge>;
    case 'active':
      return <Badge className="bg-green-100 text-green-800">در حال انجام</Badge>;
    case 'overdue':
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          عقب‌افتاده
        </Badge>
      );
    case 'closed':
      return <Badge className="bg-gray-100 text-gray-800">بسته</Badge>;
    default:
      return <Badge variant="outline">{exerciseStatus}</Badge>;
  }
};

export const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'آسان':
      return <Badge className="bg-green-100 text-green-800">{difficulty}</Badge>;
    case 'متوسط':
      return <Badge className="bg-yellow-100 text-yellow-800">{difficulty}</Badge>;
    case 'سخت':
      return <Badge className="bg-red-100 text-red-800">{difficulty}</Badge>;
    default:
      return <Badge variant="outline">{difficulty}</Badge>;
  }
};
