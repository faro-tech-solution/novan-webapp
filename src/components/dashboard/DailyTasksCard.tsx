
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface DailyTask {
  id: number;
  task: string;
  completed: boolean;
}

export const DailyTasksCard = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: 1, task: 'بررسی تمرین‌های جدید', completed: false },
    { id: 2, task: 'مرور مطالب درسی', completed: true },
    { id: 3, task: 'انجام تمرین‌های عقب‌افتاده', completed: false },
    { id: 4, task: 'مطالعه منابع اضافی', completed: true },
  ]);

  const toggleTask = (taskId: number) => {
    setDailyTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>وظایف روزانه</CardTitle>
        <CardDescription>برنامه‌ریزی روزانه یادگیری</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>پیشرفت روزانه</span>
              <span>{completedTasks}/{dailyTasks.length} تکمیل شده</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            {dailyTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                </button>
                <span className={`text-sm cursor-pointer ${
                  task.completed ? 'line-through text-gray-500' : 'hover:text-gray-700'
                }`} onClick={() => toggleTask(task.id)}>
                  {task.task}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
