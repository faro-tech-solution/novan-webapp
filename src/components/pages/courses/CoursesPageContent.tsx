'use client';

import { useEffect, useState } from 'react';
import { PublicCourse } from '@/types/course';
import { fetchPublicCourses } from '@/services/courseService';
import PublicCourseCard from '@/components/courses/PublicCourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

export default function CoursesPageContent() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<PublicCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, priceFilter, statusFilter]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPublicCourses();
      setCourses(data);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('خطا در بارگذاری دوره‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(course => !course.price || course.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(course => course.price && course.price > 0);
    }

    // Status filter (if needed)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || priceFilter !== 'all' || statusFilter !== 'all';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Button onClick={loadCourses}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredCourses.length} دوره یافت شد
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 mt-1">
                از مجموع {courses.length} دوره
              </p>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو در دوره‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Price Filter */}
          <div className="lg:w-48">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع قیمت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دوره‌ها</SelectItem>
                <SelectItem value="free">رایگان</SelectItem>
                <SelectItem value="paid">پولی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="upcoming">آینده</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-2">
              جستجو: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              قیمت: {priceFilter === 'free' ? 'رایگان' : 'پولی'}
              <button
                onClick={() => setPriceFilter('all')}
                className="hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              وضعیت: {statusFilter === 'active' ? 'فعال' : 'آینده'}
              <button
                onClick={() => setStatusFilter('all')}
                className="hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            دوره‌ای یافت نشد
          </h3>
          <p className="text-gray-600 mb-4">
            با فیلترهای فعلی هیچ دوره‌ای پیدا نشد. فیلترها را تغییر دهید یا پاک کنید.
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <PublicCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
