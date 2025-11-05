"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useReportedIssues, useReportedIssueStats } from "@/hooks/queries/useReportedIssues";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { IssueStatus, ReportedIssueWithUser } from "@/types/reportedIssue";
import { AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<IssueStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  open: {
    label: "باز",
    variant: "destructive",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  in_progress: {
    label: "در حال بررسی",
    variant: "secondary",
    icon: <Clock className="h-4 w-4" />,
  },
  resolved: {
    label: "حل شده",
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  closed: {
    label: "بسته شده",
    variant: "outline",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export const ReportedIssues = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssueWithUser | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<IssueStatus | "">("");
  const { issues, isLoading, error, updateIssue, isUpdating } = useReportedIssues(
    selectedStatus === "all" ? undefined : selectedStatus
  );
  const stats = useReportedIssueStats();
  const { toast } = useToast();

  const handleStatusChange = async () => {
    if (!selectedIssue || !newStatus) return;

    try {
      await updateIssue({
        issueId: selectedIssue.id,
        updates: {
          status: newStatus as IssueStatus,
          admin_notes: adminNotes || selectedIssue.admin_notes || undefined,
        },
      });
      toast({
        title: "موفقیت",
        description: "وضعیت مشکل با موفقیت به‌روزرسانی شد",
      });
      setSelectedIssue(null);
      setAdminNotes("");
      setNewStatus("");
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی وضعیت",
        variant: "destructive",
      });
    }
  };

  const openIssueDialog = (issue: ReportedIssueWithUser) => {
    setSelectedIssue(issue);
    setAdminNotes(issue.admin_notes || "");
    setNewStatus(issue.status);
  };

  return (
    <DashboardLayout title="مدیریت مشکلات گزارش شده">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
            مدیریت مشکلات گزارش شده
          </h2>
          <p className="text-gray-600">مشاهده و مدیریت تمام مشکلات گزارش شده توسط کاربران</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل مشکلات</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">باز</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.open}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">در حال بررسی</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حل شده</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">بسته شده</CardTitle>
                <XCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{stats.closed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>فیلترها</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="انتخاب وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="open">باز</SelectItem>
                <SelectItem value="in_progress">در حال بررسی</SelectItem>
                <SelectItem value="resolved">حل شده</SelectItem>
                <SelectItem value="closed">بسته شده</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست مشکلات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                خطا در دریافت مشکلات: {error instanceof Error ? error.message : 'خطای نامشخص'}
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                مشکلی یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان</TableHead>
                      <TableHead>کاربر</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ ایجاد</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => {
                      const statusInfo = statusConfig[issue.status];
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">
                            {issue.title}
                          </TableCell>
                          <TableCell>
                            {(issue.user || issue.profiles)?.first_name} {(issue.user || issue.profiles)?.last_name}
                            <br />
                            <span className="text-xs text-gray-500">
                              {(issue.user || issue.profiles)?.email}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate({ dateString: issue.created_at })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openIssueDialog(issue)}
                            >
                              مشاهده و ویرایش
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Detail Dialog */}
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>جزئیات مشکل</DialogTitle>
              <DialogDescription>
                مشاهده و مدیریت وضعیت مشکل
              </DialogDescription>
            </DialogHeader>
            {selectedIssue && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">عنوان</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedIssue.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">توضیحات</label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {selectedIssue.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">گزارش‌دهنده</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {(selectedIssue.user || selectedIssue.profiles)?.first_name} {(selectedIssue.user || selectedIssue.profiles)?.last_name} ({(selectedIssue.user || selectedIssue.profiles)?.email})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">تاریخ ایجاد</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatDate({ dateString: selectedIssue.created_at })}
                  </p>
                </div>
                {selectedIssue.resolved_at && (
                  <div>
                    <label className="text-sm font-medium">تاریخ حل شدن</label>
                    <p className="text-sm text-gray-700 mt-1">
                      {formatDate({ dateString: selectedIssue.resolved_at })}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">وضعیت</label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as IssueStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">باز</SelectItem>
                      <SelectItem value="in_progress">در حال بررسی</SelectItem>
                      <SelectItem value="resolved">حل شده</SelectItem>
                      <SelectItem value="closed">بسته شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">یادداشت مدیر</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="یادداشت‌های خود را وارد کنید..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIssue(null)}
                    disabled={isUpdating}
                  >
                    انصراف
                  </Button>
                  <Button onClick={handleStatusChange} disabled={isUpdating}>
                    {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
