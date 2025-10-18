import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instructor } from '@/types/event';
import { Users } from 'lucide-react';

interface PresenterListProps {
  presenters: Instructor[];
  className?: string;
}

const PresenterList = ({ presenters, className = "" }: PresenterListProps) => {
  if (presenters.length === 0) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          ارائه‌دهندگان ({presenters.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {presenters.map((presenter) => (
            <div key={presenter.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={`${presenter.first_name ?? ''} ${presenter.last_name ?? ''}`} />
                <AvatarFallback>
                  {getInitials(presenter.first_name ?? '', presenter.last_name ?? '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {presenter.first_name ?? ''} {presenter.last_name ?? ''}
                </p>
                <p className="text-sm text-gray-500">{presenter.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PresenterList;
