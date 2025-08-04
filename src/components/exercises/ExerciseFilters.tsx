
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Course } from '@/types/course';

interface ExerciseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  exerciseStatusFilter: string;
  setExerciseStatusFilter: (value: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (value: string) => void;
  courseFilter: string;
  setCourseFilter: (value: string) => void;
  courses: Course[];
}

export const ExerciseFilters = ({
  searchTerm,
  setSearchTerm,
  exerciseStatusFilter,
  setExerciseStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  courseFilter,
  setCourseFilter,
  courses
}: ExerciseFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 ml-2" />
          فیلتر و جستجو
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو در تمرین‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <Select value={exerciseStatusFilter} onValueChange={setExerciseStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="وضعیت تمرین" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="upcoming">آینده</SelectItem>
              <SelectItem value="active">در حال انجام</SelectItem>
              <SelectItem value="overdue">عقب‌افتاده</SelectItem>
              <SelectItem value="closed">بسته</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="سطح دشواری" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه سطوح</SelectItem>
              <SelectItem value="آسان">آسان</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="سخت">سخت</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="دوره" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دوره‌ها</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
