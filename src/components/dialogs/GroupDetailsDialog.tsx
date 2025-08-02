import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Plus, 
  MessageCircle,
  Calendar,
  User,
  Mail
} from 'lucide-react';
import { useGroupWithDetailsQuery } from '@/hooks/queries/useGroupsQuery';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';
import { useAddGroupMembersMutation, useRemoveGroupMembersMutation } from '@/hooks/queries/useGroupsQuery';
import { useAddGroupCoursesMutation, useRemoveGroupCoursesMutation } from '@/hooks/queries/useGroupsQuery';

interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

const GroupDetailsDialog = ({ open, onOpenChange, groupId }: GroupDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Queries
  const { data: group, isLoading, error } = useGroupWithDetailsQuery(groupId);
  const { users = [] } = useUsersQuery();
  const { courses = [] } = useCoursesQuery();

  // Mutations
  const addMembersMutation = useAddGroupMembersMutation();
  const _removeMembersMutation = useRemoveGroupMembersMutation();
  const addCoursesMutation = useAddGroupCoursesMutation();
  const _removeCoursesMutation = useRemoveGroupCoursesMutation();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">در حال بارگذاری...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !group) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center text-red-500">
            خطا در بارگذاری جزئیات گروه
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    
    try {
      await addMembersMutation.mutateAsync({
        group_id: groupId,
        user_ids: selectedMembers,
      });
      setSelectedMembers([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      await addCoursesMutation.mutateAsync({
        group_id: groupId,
        course_ids: selectedCourses,
      });
      setSelectedCourses([]);
    } catch (error) {
      console.error(error);
    }
  };

  const getAvailableUsers = () => {
    const memberIds = group.members.map(m => m.user_id);
    return users.filter(user => !memberIds.includes(user.id));
  };

  const getAvailableCourses = () => {
    const courseIds = group.courses.map(c => c.course_id);
    return courses.filter(course => !courseIds.includes(course.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>جزئیات گروه: {group.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="members">اعضا</TabsTrigger>
            <TabsTrigger value="courses">دوره‌ها</TabsTrigger>
            <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات گروه</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">توضیحات:</h4>
                  <p className="text-gray-600">{group.description || 'بدون توضیحات'}</p>
                </div>
                
                {group.telegram_channels && (
                  <div>
                    <h4 className="font-medium flex items-center space-x-1 space-x-reverse">
                      <MessageCircle className="h-4 w-4" />
                      <span>کانال‌های تلگرام:</span>
                    </h4>
                    <p className="text-gray-600">{group.telegram_channels}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{group.members.length} عضو</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>{group.courses.length} دوره</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>ایجاد شده در {new Date(group.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت اعضا</CardTitle>
                <CardDescription>
                  اعضای فعلی گروه و افزودن اعضای جدید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Members */}
                <div>
                  <h4 className="font-medium mb-2">اعضای فعلی ({group.members.length})</h4>
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{member.user?.first_name} {member.user?.last_name}</span>
                          <Badge variant="outline">{member.user?.role}</Badge>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{member.user?.email}</span>
                        </div>
                      </div>
                    ))}
                    {group.members.length === 0 && (
                      <p className="text-gray-500 text-center py-4">هیچ عضوی در این گروه وجود ندارد</p>
                    )}
                  </div>
                </div>

                {/* Add New Members */}
                <div>
                  <h4 className="font-medium mb-2">افزودن اعضای جدید</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getAvailableUsers().map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedMembers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, user.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <label htmlFor={`user-${user.id}`} className="flex items-center space-x-2 space-x-reverse">
                          <span>{user.first_name} {user.last_name}</span>
                          <Badge variant="outline">{user.role}</Badge>
                        </label>
                      </div>
                    ))}
                    {getAvailableUsers().length === 0 && (
                      <p className="text-gray-500 text-center py-2">همه کاربران در این گروه عضو هستند</p>
                    )}
                  </div>
                  {selectedMembers.length > 0 && (
                    <Button onClick={handleAddMembers} className="mt-2" size="sm">
                      <Plus className="h-4 w-4 ml-1" />
                      افزودن {selectedMembers.length} عضو
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت دوره‌ها</CardTitle>
                <CardDescription>
                  دوره‌های تخصیص داده شده به گروه
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Courses */}
                <div>
                  <h4 className="font-medium mb-2">دوره‌های فعلی ({group.courses.length})</h4>
                  <div className="space-y-2">
                    {group.courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{course.course?.name}</div>
                          <div className="text-sm text-gray-500">{course.course?.description}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(course.assigned_at).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                    ))}
                    {group.courses.length === 0 && (
                      <p className="text-gray-500 text-center py-4">هیچ دوره‌ای به این گروه تخصیص داده نشده</p>
                    )}
                  </div>
                </div>

                {/* Add New Courses */}
                <div>
                  <h4 className="font-medium mb-2">افزودن دوره‌های جدید</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getAvailableCourses().map((course) => (
                      <div key={course.id} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourses.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCourses([...selectedCourses, course.id]);
                            } else {
                              setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                            }
                          }}
                        />
                        <label htmlFor={`course-${course.id}`}>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.description}</div>
                        </label>
                      </div>
                    ))}
                    {getAvailableCourses().length === 0 && (
                      <p className="text-gray-500 text-center py-2">همه دوره‌ها به این گروه تخصیص داده شده‌اند</p>
                    )}
                  </div>
                  {selectedCourses.length > 0 && (
                    <Button onClick={handleAddCourses} className="mt-2" size="sm">
                      <Plus className="h-4 w-4 ml-1" />
                      افزودن {selectedCourses.length} دوره
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات گروه</CardTitle>
                <CardDescription>
                  اطلاعات و تنظیمات پیشرفته گروه
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">شناسه گروه:</h4>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{group.id}</code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">تاریخ ایجاد:</h4>
                    <p>{new Date(group.created_at).toLocaleString('fa-IR')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">آخرین بروزرسانی:</h4>
                    <p>{new Date(group.updated_at).toLocaleString('fa-IR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailsDialog; 