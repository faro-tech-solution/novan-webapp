import { EventWithPresenters } from '@/types/event';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getStatusBadgeVariant, getStatusText, formatEventDate } from '@/constants/eventConstants';

interface EventCardProps {
  event: EventWithPresenters;
  className?: string;
}

const EventCard = ({ event, className = "" }: EventCardProps) => {

  return (
    <Link href={`/events/${event.id}`} className="block mb-4">
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <div className="flex flex-col sm:flex-row">
          {event.thumbnail && (
            <div className="relative h-48 sm:h-auto sm:w-48 md:w-56">
              <Image
                src={event.thumbnail}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
                <Badge variant={getStatusBadgeVariant(event.status)} className="shrink-0">
                  {getStatusText(event.status)}
                </Badge>
              </div>
              {event.subtitle && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.subtitle}</p>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatEventDate(event.start_date)}</span>
              </div>

              {event.presenters.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    {event.presenters.map((presenter) => (
                      <span key={presenter.id} className="text-xs">
                        {presenter.first_name} {presenter.last_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
