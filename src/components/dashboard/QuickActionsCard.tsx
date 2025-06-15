
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Award, Calendar, Trophy } from 'lucide-react';

export const QuickActionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>دسترسی سریع</CardTitle>
        <CardDescription>به بخش‌های مختلف دسترسی پیدا کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/my-exercises">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>تمرین‌های من</span>
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
              <Award className="h-6 w-6" />
              <span>پیشرفت تحصیلی</span>
            </Button>
          </Link>
          <Link to="/student-courses">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
              <Award className="h-6 w-6" />
              <span>دوره‌های من</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2" disabled>
            <Trophy className="h-6 w-6" />
            <span>جوایز من</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
