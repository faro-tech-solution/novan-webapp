import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './OverviewTab';
import { QATab } from './QATab';
import { NotesTab } from './NotesTab';
import { ExerciseDetail } from '@/types/exercise';

interface ExerciseTabsProps {
  exercise: ExerciseDetail;
}

export const ExerciseTabs: React.FC<ExerciseTabsProps> = ({ exercise }) => {
  return (
    <div className="mt-2">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes">یادداشت‌ها</TabsTrigger>
          <TabsTrigger value="qa">پرسش و پاسخ</TabsTrigger>
          <TabsTrigger value="overview">اطلاعات کلی</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-2" dir='rtl'>
          <OverviewTab exercise={exercise} />
        </TabsContent>
        
        <TabsContent value="qa" className="mt-2" dir='rtl'>
          <QATab exercise={exercise} />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-2" dir='rtl'>
          <NotesTab exercise={exercise} />
        </TabsContent>
      </Tabs>
    </div>
  );
};