import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { fetchDailyActivities, DailyActivity } from '@/services/dailyActivitiesService';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentActivityLogs } from '@/services/activityLogService';

interface DailyTasksCardProps {
  // Optionally accept userId as prop, or get from context
}

export const DailyTasksCard = ({}: DailyTasksCardProps) => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogger();
  const [dailyTasks, setDailyTasks] = useState<DailyActivity[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch daily activities
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const activities = await fetchDailyActivities();
      setDailyTasks(activities);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  // Fetch completed tasks for today
  useEffect(() => {
    if (!user) return;
    const fetchCompleted = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const logs = await fetchStudentActivityLogs(user.id, today, tomorrow, 'daily_task_complete');
      const doneIds = new Set<string>();
      logs.forEach(log => {
        if (log.activity_data && log.activity_data.daily_activity_id) {
          doneIds.add(log.activity_data.daily_activity_id);
        }
      });
      setCompletedTaskIds(doneIds);
    };
    fetchCompleted();
  }, [user, dailyTasks]);

  const handleToggleTask = async (task: DailyActivity) => {
    if (!user) return;
    if (completedTaskIds.has(task.id)) return; // Already done
    // Log as done
    await logActivity('daily_task_complete', { daily_activity_id: task.id, title: task.title }, task.points);
    setCompletedTaskIds(prev => new Set(prev).add(task.id));
  };

  const completedTasks = dailyTasks.filter(task => completedTaskIds.has(task.id)).length;
  const progressPercentage = dailyTasks.length > 0 ? (completedTasks / dailyTasks.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">کارهای روزانه</h3>
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
            {loading ? (
              <div className="text-center text-gray-400">در حال بارگذاری...</div>
            ) : dailyTasks.length === 0 ? (
              <div className="text-center text-gray-400">وظیفه‌ای برای امروز وجود ندارد</div>
            ) : (
              dailyTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleToggleTask(task)}
                    disabled={completedTaskIds.has(task.id)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      completedTaskIds.has(task.id)
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {completedTaskIds.has(task.id) && <CheckCircle className="h-3 w-3 text-white" />}
                  </button>
                  <span className={`text-sm cursor-pointer ${
                    completedTaskIds.has(task.id) ? 'line-through text-gray-500' : 'hover:text-gray-700'
                  }`} onClick={() => handleToggleTask(task)}>
                    {task.title}
                  </span>
                  {task.points > 0 && (
                    <span className="text-xs text-blue-500 ml-2">+{task.points} امتیاز</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
