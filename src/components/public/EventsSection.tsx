import { useState, useEffect } from 'react';
import EventCard from '@/components/events/EventCard';
import { eventService } from '@/services/eventService';
import { EventWithPresenters } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EventsSection = () => {
  const [events, setEvents] = useState<EventWithPresenters[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Load upcoming events for homepage
      const data = await eventService.fetchPublicEvents(['upcoming']);
      // Show only the next 4 upcoming events
      setEvents(data.slice(0, 4));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);


  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">در حال بارگذاری رویدادها...</div>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no events
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              رویدادهای آینده
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            در رویدادهای آموزشی ما شرکت کنید و از تجربیات ارزشمند بهره‌مند شوید
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event}
              className="bg-white"
            />
          ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-gray-200 hover:bg-[#6e61b5] hover:text-white text-[#6e61b5] px-8 py-4 rounded-lg">
            <Link href="/events" className="flex items-center gap-2">
              مشاهده همه رویدادها
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
