'use client';

import { AdminDashboard } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}