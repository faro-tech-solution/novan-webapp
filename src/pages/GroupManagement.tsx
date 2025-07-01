import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupsQuery, useGroupStatsQuery } from '@/hooks/queries/useGroupsQuery';
import { Group } from '@/types/group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateGroupDialog from '@/components/CreateGroupDialog';
import EditGroupDialog from '@/components/EditGroupDialog';
import GroupDetailsDialog from '@/components/GroupDetailsDialog';
import ConfirmDeleteGroupDialog from '@/components/ConfirmDeleteGroupDialog';

const GroupManagement = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Queries
  const { data: groups = [], isLoading, error } = useGroupsQuery({ search: searchQuery });
  const { data: stats } = useGroupStatsQuery();

  // Check admin access
  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout title="مدیریت گروه‌ها">
        <Alert>
          <AlertDescription>
            شما مجوز دسترسی به این صفحه را ندارید. (نقش شما: {profile?.role || 'نامشخص'})
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowEditDialog(true);
  };

  const handleViewDetails = (group: Group) => {
    setSelectedGroup(group);
    setShowDetailsDialog(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowDeleteDialog(true);
  };

  const handleCreateGroup = () => {
    setShowCreateDialog(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="مدیریت گروه‌ها">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت گروه‌ها">
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری گروه‌ها: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت گروه‌ها">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مدیریت گروه‌ها</h2>
            <p className="text-gray-600">ایجاد و مدیریت گروه‌های کاربران</p>
          </div>
          <Button onClick={handleCreateGroup}>
            <Plus className="h-4 w-4 ml-2" />
            ایجاد گروه جدید
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل گروه‌ها</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_groups}</div>
                <p className="text-xs text-muted-foreground">گروه فعال</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل اعضا</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_members}</div>
                <p className="text-xs text-muted-foreground">کاربر در گروه‌ها</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">دوره‌های تخصیص داده شده</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_courses_assigned}</div>
                <p className="text-xs text-muted-foreground">دوره به گروه‌ها</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">میانگین اعضا</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_members_per_group}</div>
                <p className="text-xs text-muted-foreground">در هر گروه</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="جستجو در گروه‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {group.description || 'بدون توضیحات'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(group)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{group.member_count || 0} عضو</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{group.course_count || 0} دوره</span>
                    </div>
                  </div>

                  {/* Telegram Channels */}
                  {group.telegram_channels && (
                    <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>کانال‌های تلگرام: {group.telegram_channels}</span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      ایجاد شده در {new Date(group.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ گروهی یافت نشد</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'هیچ گروهی با این جستجو مطابقت ندارد.' : 'هنوز هیچ گروهی ایجاد نشده است.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateGroup}>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد اولین گروه
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedGroup && (
        <>
          <EditGroupDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            group={selectedGroup}
          />

          <GroupDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            groupId={selectedGroup.id}
          />

          <ConfirmDeleteGroupDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            group={selectedGroup}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default GroupManagement; 