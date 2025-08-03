'use client';

import { Accounting } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AccountingPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Accounting />
    </ProtectedRoute>
  );
}