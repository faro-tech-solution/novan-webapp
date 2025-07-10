import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveTable } from "@/components/ui/responsive-table";

const priorities = [
  { value: "low", label: "کم" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "زیاد" },
];

const fetchTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `*, subtasks(*), assigned_to:profiles!tasks_assigned_to_fkey(id, first_name, last_name)`
    )
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data || [];
};

const fetchTeammates = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "teammate");
  if (error) throw error;
  return data || [];
};

const TasksManagement = () => {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showInstructionDialog, setShowInstructionDialog] = useState(false);
  const [selectedTaskInstruction, setSelectedTaskInstruction] =
    useState<string>("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    instruction: "",
    priority: "",
    due_date: "",
    assigned_to: "",
  });
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [subtaskInputs, setSubtaskInputs] = useState<{
    [taskId: string]: string;
  }>({});

  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: errorTasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const {
    data: teammates = [],
    isLoading: loadingTeammates,
    error: errorTeammates,
  } = useQuery({
    queryKey: ["teammates"],
    queryFn: fetchTeammates,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: any) => {
      const { error } = await supabase.from("tasks").insert([newTask]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowTaskDialog(false);
      setTaskForm({
        title: "",
        description: "",
        instruction: "",
        priority: "",
        due_date: "",
        assigned_to: "",
      });
      toast({ title: "موفقیت", description: "کار با موفقیت ایجاد شد." });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ایجاد کار",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowTaskDialog(false);
      setEditingTask(null);
      setTaskForm({
        title: "",
        description: "",
        instruction: "",
        priority: "",
        due_date: "",
        assigned_to: "",
      });
      toast({ title: "موفقیت", description: "کار با موفقیت ویرایش شد." });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ویرایش کار",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowDeleteDialog(false);
      setDeleteTaskId(null);
      toast({ title: "موفقیت", description: "کار با موفقیت حذف شد." });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در حذف کار",
        variant: "destructive",
      });
    },
  });

  // Subtask mutations
  const createSubtaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      title,
    }: {
      taskId: string;
      title: string;
    }) => {
      const { error } = await supabase
        .from("subtasks")
        .insert([{ task_id: taskId, title }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "موفقیت",
        description: "کار زیر مجموعه با موفقیت ایجاد شد.",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ایجاد کار زیر مجموعه",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      instruction: "",
      priority: "",
      due_date: "",
      assigned_to: "",
    });
    setShowTaskDialog(true);
  };
  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      instruction: task.instruction || "",
      priority: task.priority || "",
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      assigned_to: task.assigned_to?.id || "",
    });
    setShowTaskDialog(true);
  };
  const handleSaveTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, updates: taskForm });
    } else {
      createTaskMutation.mutate(taskForm);
    }
  };
  const handleDeleteTask = (id: string) => {
    setDeleteTaskId(id);
    setShowDeleteDialog(true);
  };
  const confirmDeleteTask = () => {
    if (deleteTaskId) deleteTaskMutation.mutate(deleteTaskId);
  };

  const handleViewInstruction = (instruction: string) => {
    setSelectedTaskInstruction(instruction);
    setShowInstructionDialog(true);
  };

  return (
    <DashboardLayout title="مدیریت کارها">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">مدیریت کارها</h2>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 ml-2" />
          افزودن کار
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>لیست کارها</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTasks ? (
            <div className="text-center py-8 text-gray-500">
              در حال بارگذاری...
            </div>
          ) : errorTasks ? (
            <div className="text-center py-8 text-red-500">
              خطا در بارگذاری کارها
            </div>
          ) : (
            <ResponsiveTable
              headers={[
                "عنوان",
                "اولویت",
                "تاریخ سررسید",
                "هم‌تیمی",
                "دستورالعمل",
                "کارهای زیر مجموعه",
                "عملیات",
              ]}
            >
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    هیچ کاری ثبت نشده است.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task: any) => (
                  <Fragment key={task.id}>
                    <TableRow>
                      <TableCell>
                        <div>{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {
                          priorities.find((p) => p.value === task.priority)
                            ?.label
                        }
                      </TableCell>
                      <TableCell>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("fa-IR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {task.assigned_to
                          ? `${task.assigned_to.first_name || ""} ${
                              task.assigned_to.last_name || ""
                            }`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {task.instruction ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewInstruction(task.instruction)
                            }
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            مشاهده دستورالعمل
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {(task.subtasks || []).length}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setExpandedTaskId(
                              expandedTaskId === task.id ? null : task.id
                            )
                          }
                        >
                          {expandedTaskId === task.id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(task)}
                        >
                          <Edit2 />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTaskId === task.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold">
                                کارهای زیر مجموعه
                              </span>
                              <div className="flex gap-2 items-center">
                                <Input
                                  size={10}
                                  placeholder="عنوان کار زیر مجموعه"
                                  value={subtaskInputs[task.id] || ""}
                                  onChange={(e) =>
                                    setSubtaskInputs((inputs) => ({
                                      ...inputs,
                                      [task.id]: e.target.value,
                                    }))
                                  }
                                  className="w-40"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if ((subtaskInputs[task.id] || "").trim()) {
                                      createSubtaskMutation.mutate({
                                        taskId: task.id,
                                        title: subtaskInputs[task.id],
                                      });
                                      setSubtaskInputs((inputs) => ({
                                        ...inputs,
                                        [task.id]: "",
                                      }));
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4 ml-1" />
                                  افزودن کار زیر مجموعه
                                </Button>
                              </div>
                            </div>
                            <ul className="space-y-2">
                              {(task.subtasks || []).length === 0 ? (
                                <li className="text-gray-400">
                                  هیچ کار زیر مجموعه‌ای ثبت نشده است.
                                </li>
                              ) : (
                                task.subtasks.map((subtask: any) => (
                                  <li
                                    key={subtask.id}
                                    className="flex items-center justify-between"
                                  >
                                    <span>{subtask.title}</span>
                                    <div>
                                      <Button variant="ghost" size="icon">
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              )}
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "ویرایش کار" : "افزودن کار جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="عنوان کار"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
            />
            <Input
              placeholder="توضیحات"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />
            <Textarea
              placeholder="دستورالعمل"
              value={taskForm.instruction}
              onChange={(e) =>
                setTaskForm({ ...taskForm, instruction: e.target.value })
              }
              rows={4}
            />
            <Select
              value={taskForm.priority}
              onValueChange={(value) =>
                setTaskForm({ ...taskForm, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="تاریخ سررسید"
              value={taskForm.due_date}
              onChange={(e) =>
                setTaskForm({ ...taskForm, due_date: e.target.value })
              }
            />
            <Select
              value={taskForm.assigned_to}
              onValueChange={(value) =>
                setTaskForm({ ...taskForm, assigned_to: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب هم‌تیمی" />
              </SelectTrigger>
              <SelectContent>
                {loadingTeammates ? (
                  <SelectItem value="" disabled>
                    در حال بارگذاری...
                  </SelectItem>
                ) : errorTeammates ? (
                  <SelectItem value="" disabled>
                    خطا در بارگذاری
                  </SelectItem>
                ) : teammates.length === 0 ? (
                  <SelectItem value="" disabled>
                    هم‌تیمی‌ای وجود ندارد
                  </SelectItem>
                ) : (
                  teammates.map((tm: any) => (
                    <SelectItem key={tm.id} value={tm.id}>{`${
                      tm.first_name || ""
                    } ${tm.last_name || ""}`}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Button onClick={handleSaveTask}>ذخیره</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>آیا از حذف کار مطمئن هستید؟</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>این عملیات برای کار {deleteTaskId} انجام خواهد شد.</p>
            <div className="flex justify-end">
              <Button onClick={confirmDeleteTask}>ذخیره</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showInstructionDialog}
        onOpenChange={setShowInstructionDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>دستورالعمل کار</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {selectedTaskInstruction}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowInstructionDialog(false)}>
                بستن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TasksManagement;
