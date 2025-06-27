import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const FILTERS = [
  { value: 'my', label: 'کارهای من' },
  { value: 'completed', label: 'کارهای تکمیل شده' },
  { value: 'overdue', label: 'کارهای تاریخ گذشته' },
];

const getBadge = (dueDate: string, isCompleted: boolean) => {
  if (isCompleted) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.floor((due.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return <Badge className="bg-red-100 text-red-700">تاریخ گذشته</Badge>;
  if (diffDays === 0) return <Badge className="bg-yellow-100 text-yellow-700">امروز</Badge>;
  if (diffDays <= 2) return <Badge className="bg-blue-100 text-blue-700">۲ روز آینده</Badge>;
  return null;
};

const fetchTeammateTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, subtasks(*)')
    .eq('assigned_to', userId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data || [];
};

const TeammateTasks = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState('my');

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['teammate-tasks', profile?.id],
    queryFn: () => fetchTeammateTasks(profile?.id || ''),
    enabled: !!profile?.id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase.from('tasks').update({ is_completed }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teammate-tasks', profile?.id] });
      toast({ title: 'موفقیت', description: 'وضعیت کار بروزرسانی شد.' });
    },
    onError: () => {
      toast({ title: 'خطا', description: 'خطا در بروزرسانی کار', variant: 'destructive' });
    }
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase.from('subtasks').update({ is_completed }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teammate-tasks', profile?.id] });
      toast({ title: 'موفقیت', description: 'وضعیت کار زیر مجموعه بروزرسانی شد.' });
    },
    onError: () => {
      toast({ title: 'خطا', description: 'خطا در بروزرسانی کار زیر مجموعه', variant: 'destructive' });
    }
  });

  // Filter tasks
  let filteredTasks = tasks;
  if (filter === 'completed') {
    filteredTasks = tasks.filter((t: any) => t.is_completed);
  } else if (filter === 'overdue') {
    filteredTasks = tasks.filter((t: any) => !t.is_completed && t.due_date && new Date(t.due_date) < new Date());
  } else {
    filteredTasks = tasks.filter((t: any) => !t.is_completed);
  }

  return (
    <DashboardLayout title="کارهای من">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">کارهای من</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فیلتر کارها" />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>لیست کارها</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">خطا در بارگذاری کارها</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">عنوان</TableHead>
                  <TableHead className="text-right">تاریخ سررسید</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">کار زیر مجموعه</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400">هیچ کارهایی یافت نشد.</TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task: any) => (
                    <>
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                          )}
                        </TableCell>
                        <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString('fa-IR') : '-'}</TableCell>
                        <TableCell>
                          {task.is_completed ? (
                            <Badge className="bg-green-100 text-green-700">تکمیل شده</Badge>
                          ) : getBadge(task.due_date, false)}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">{(task.subtasks || []).length}</span>
                          <Button variant="ghost" size="icon" onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}>
                            {expandedTaskId === task.id ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {!task.is_completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskMutation.mutate({ id: task.id, is_completed: true })}
                              disabled={task.subtasks && task.subtasks.length > 0 && task.subtasks.some((st: any) => !st.is_completed)}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />تکمیل کن
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedTaskId === task.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50">
                            <div>
                              <div className="font-bold mb-2">کارهای زیر مجموعه</div>
                              <ul className="space-y-2">
                                {(task.subtasks || []).length === 0 ? (
                                  <li className="text-gray-400">هیچ کار زیر مجموعه‌ای ثبت نشده است.</li>
                                ) : (
                                  task.subtasks.map((subtask: any) => (
                                    <li key={subtask.id} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={!!subtask.is_completed}
                                        onChange={() => updateSubtaskMutation.mutate({ id: subtask.id, is_completed: !subtask.is_completed })}
                                        className="accent-green-600"
                                      />
                                      <span className={subtask.is_completed ? 'line-through text-gray-400' : ''}>{subtask.title}</span>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TeammateTasks; 