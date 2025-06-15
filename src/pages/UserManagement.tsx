
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';

const UserManagementPage = () => {
  return (
    <DashboardLayout title="مدیریت کاربران">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت کاربران</h2>
          <p className="text-gray-600">مدیریت کاربران و نقش‌های سیستم</p>
        </div>

        {/* User Management Component */}
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default UserManagementPage;
