
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="پنل مدیریت">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-peyda">پنل مدیریت سیستم</h2>
          <p className="text-gray-600">مدیریت کاربران و دسترسی‌های سیستم</p>
        </div>

        {/* User Management */}
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
