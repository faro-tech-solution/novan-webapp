'use client';

import { Students } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Students />
    </ProtectedRoute>
  );
}