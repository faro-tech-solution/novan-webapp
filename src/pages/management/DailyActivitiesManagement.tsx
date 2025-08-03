import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchDailyActivities,
  DailyActivity,
} from "@/services/dailyActivitiesService";
import { supabase } from "@/integrations/supabase/client";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";

const emptyForm = { title: "", description: "", points: 0, is_active: true };

const DailyActivitiesManagement = () => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<DailyActivity | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState<DailyActivity | null>(null);

  const loadActivities = async () => {
    setLoading(true);
    setActivities(await fetchDailyActivities());
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (activity: DailyActivity) => {
    setEditing(activity);
    setForm({
      title: activity.title,
      description: activity.description || "",
      points: activity.points,
      is_active: activity.is_active,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (editing) {
      // Update
      await supabase
        .from("daily_activities")
        .update({
          title: form.title,
          description: form.description,
          points: form.points,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editing.id);
    } else {
      // Create
      await supabase.from("daily_activities").insert({
        title: form.title,
        description: form.description,
        points: form.points,
        is_active: form.is_active,
      });
    }
    setShowDialog(false);
    loadActivities();
  };

  const handleDelete = async () => {
    if (deleting) {
      await supabase.from("daily_activities").delete().eq("id", deleting.id);
      setShowDeleteDialog(false);
      loadActivities();
    }
  };

  return (
    <DashboardLayout title="مدیریت وظایف روزانه">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-peyda">مدیریت وظایف روزانه</h2>
          <Button onClick={openCreate}>افزودن وظیفه جدید</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>لیست وظایف روزانه</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                در حال بارگذاری...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                وظیفه‌ای ثبت نشده است
              </div>
            ) : (
              <table className="w-full text-sm rtl text-right border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">عنوان</th>
                    <th className="p-2">توضیحات</th>
                    <th className="p-2">امتیاز</th>
                    <th className="p-2">فعال</th>
                    <th className="p-2">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-b">
                      <td className="p-2">{activity.title}</td>
                      <td className="p-2">{activity.description}</td>
                      <td className="p-2">{activity.points}</td>
                      <td className="p-2">
                        {activity.is_active ? "بله" : "خیر"}
                      </td>
                      <td className="p-2 space-x-2 space-x-reverse">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(activity)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleting(activity);
                            setShowDeleteDialog(true);
                          }}
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "ویرایش وظیفه" : "افزودن وظیفه جدید"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="عنوان وظیفه"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="توضیحات"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="امتیاز"
                value={form.points}
                onChange={(e) =>
                  setForm({ ...form, points: Number(e.target.value) })
                }
              />
              <div>
                <label className="mr-2">فعال باشد؟</label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  انصراف
                </Button>
                <Button onClick={handleSave}>
                  {editing ? "ذخیره تغییرات" : "افزودن"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          course={
            deleting
              ? {
                  id: deleting.id,
                  name: deleting.title,
                  description: deleting.description,
                  instructor_id: "",
                  status: "",
                  slug: "",
                  max_students: null,
                  created_at: "",
                  student_count: 0,
                }
              : null
          }
          onConfirmDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default DailyActivitiesManagement;
