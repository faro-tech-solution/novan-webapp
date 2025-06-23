import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/contexts/AuthContext';
import TeacherAssignments from './TeacherAssignments';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  is_demo?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignments, setShowAssignments] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to ensure proper typing
      const mappedUsers: UserProfile[] = (data || []).map(user => ({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role as UserRole,
        created_at: user.created_at || '',
        is_demo: user.is_demo || false,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری کاربران',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'نقش کاربر با موفقیت تغییر کرد',
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'خطا',
        description: 'خطا در تغییر نقش کاربر',
        variant: 'destructive',
      });
    }
  };

  const handleManageAccess = (user: UserProfile) => {
    setSelectedTeacher(user);
    setShowAssignments(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">مدیر</Badge>;
      case 'trainer':
        return <Badge className="bg-blue-100 text-blue-800">مربی</Badge>;
      case 'trainee':
        return <Badge className="bg-green-100 text-green-800">دانشجو</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>مدیریت کاربران</CardTitle>
          <CardDescription>
            مشاهده و مدیریت نقش‌های کاربران سیستم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">هیچ کاربری یافت نشد</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>نقش فعلی</TableHead>
                  <TableHead>تاریخ عضویت</TableHead>
                  <TableHead>تغییر نقش</TableHead>
                  <TableHead>دسترسی‌ها</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {`${user.first_name} ${user.last_name}`.trim() || 'نامشخص'}
                        {user.is_demo && <Badge className="ml-2 bg-yellow-200 text-yellow-800">آزمایشی</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trainee">دانشجو</SelectItem>
                          <SelectItem value="trainer">مربی</SelectItem>
                          <SelectItem value="admin">مدیر</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.role === 'trainer' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageAccess(user)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          تنظیم دسترسی
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {user.role === 'admin' ? 'دسترسی کامل' : 'بدون محدودیت'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Teacher Assignments Modal */}
      <TeacherAssignments
        open={showAssignments}
        onClose={() => {
          setShowAssignments(false);
          setSelectedTeacher(null);
        }}
        teacherId={selectedTeacher?.id || ''}
        teacherName={`${selectedTeacher?.first_name || ''} ${selectedTeacher?.last_name || ''}`.trim() || 'نامشخص'}
      />
    </>
  );
};

export default UserManagement;
