'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/public/Footer';
import EventCard from '@/components/events/EventCard';
import { eventService } from '@/services/eventService';
import { EventWithPresenters } from '@/types/event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Calendar } from 'lucide-react';
import { getStatusTextWithEvents } from '@/constants/eventConstants';

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithPresenters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('upcoming');

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Default to show upcoming and ongoing events
      const statuses = statusFilter === 'all' 
        ? ['upcoming', 'ongoing', 'completed'] 
        : [statusFilter];
      
      const data = await eventService.fetchPublicEvents(statuses);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری رویدادها');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            رویدادها
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            در رویدادهای آموزشی ما شرکت کنید و از تجربیات ارزشمند بهره‌مند شوید
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در رویدادها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فیلتر وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">رویدادهای آینده</SelectItem>
                <SelectItem value="ongoing">در حال برگزاری</SelectItem>
                <SelectItem value="completed">تکمیل شده</SelectItem>
                <SelectItem value="all">همه رویدادها</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">در حال بارگذاری رویدادها...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              هیچ رویدادی یافت نشد
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'هیچ رویدادی با این جستجو یافت نشد'
                : `در حال حاضر ${getStatusTextWithEvents(statusFilter)} وجود ندارد`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                از رویدادهای ما غافل نشوید
              </h3>
              <p className="text-gray-600 mb-6">
                برای اطلاع از آخرین رویدادها، در خبرنامه ما عضو شوید
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                عضویت در خبرنامه
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
