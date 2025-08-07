'use client';

import { CourseManagement } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CourseManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CourseManagement />
    </ProtectedRoute>
  );
}