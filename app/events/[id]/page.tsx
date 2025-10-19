'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/public/Footer';
import EventVideoPlayer from '@/components/events/EventVideoPlayer';
import PresenterList from '@/components/events/PresenterList';
import { eventService } from '@/services/eventService';
import { EventWithPresenters } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getStatusBadgeVariant, getStatusText, formatEventDate } from '@/constants/eventConstants';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventWithPresenters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.fetchEventById(eventId);
      if (!data) {
        setError('رویداد یافت نشد');
        return;
      }
      setEvent(data);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری رویداد');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">در حال بارگذاری رویداد...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'رویداد یافت نشد'}
            </h1>
            <Button asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                بازگشت به لیست رویدادها
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              بازگشت به لیست رویدادها
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="space-y-6">
              {event.thumbnail && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={event.thumbnail}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    {event.subtitle && (
                      <p className="text-lg text-gray-600 mt-2">{event.subtitle}</p>
                    )}
                  </div>
                  <Badge variant={getStatusBadgeVariant(event.status)} className="shrink-0">
                    {getStatusText(event.status)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">تاریخ و زمان:</span>
                    <span>{formatEventDate(event.start_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            {event.description && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">درباره رویداد</h2>
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {/* Registration Button */}
            {event.registration_link && event.status === 'upcoming' && (
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ثبت‌نام در رویداد
                </h3>
                <p className="text-gray-600 mb-4">
                  برای شرکت در این رویداد، روی دکمه زیر کلیک کنید
                </p>
                <Button asChild size="lg">
                  <a 
                    href={event.registration_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    ثبت‌نام در رویداد
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}

            {/* Video Player for Completed Events */}
            {event.status === 'completed' && event.video_url && (
              <EventVideoPlayer 
                videoUrl={event.video_url}
                eventTitle={event.title}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Presenters */}
            <PresenterList presenters={event.presenters} />

            {/* Event Info Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                اطلاعات رویداد
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">وضعیت:</span>
                  <Badge variant={getStatusBadgeVariant(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاریخ ایجاد:</span>
                  <span>{formatEventDate(event.created_at)}</span>
                </div>
                {event.presenters.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">تعداد ارائه‌دهندگان:</span>
                    <span>{event.presenters.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Events CTA */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                رویدادهای دیگر
              </h3>
              <p className="text-gray-600 mb-4">
                از سایر رویدادهای ما نیز دیدن کنید
              </p>
              <Button asChild variant="outline">
                <Link href="/events">
                  مشاهده همه رویدادها
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
