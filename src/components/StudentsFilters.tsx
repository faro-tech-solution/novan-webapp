import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface StudentsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  courseFilter: string;
  setCourseFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  courses: string[];
  showDemoUsers: boolean;
  setShowDemoUsers: (value: boolean) => void;
}

const StudentsFilters = ({
  searchTerm,
  setSearchTerm,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
  courses,
  showDemoUsers,
  setShowDemoUsers
}: StudentsFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 ml-2" />
          فیلتر و جستجو
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو در دانشجویان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="دوره" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دوره‌ها</SelectItem>
              {courses.map((courseName) => (
                <SelectItem key={courseName} value={courseName}>{courseName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <input
              type="checkbox"
              checked={showDemoUsers}
              onChange={e => setShowDemoUsers(e.target.checked)}
              className="accent-yellow-500"
              id="show-demo-users"
            />
            <label htmlFor="show-demo-users" className="text-sm">نمایش کاربران آزمایشی</label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsFilters;
