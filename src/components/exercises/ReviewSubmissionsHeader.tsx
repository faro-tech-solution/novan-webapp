
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';

interface ReviewSubmissionsHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onBack: () => void;
}

export const ReviewSubmissionsHeader: React.FC<ReviewSubmissionsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onBack
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        بازگشت
      </Button>
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="جستجو در پاسخ‌ها..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>
    </div>
  );
};
