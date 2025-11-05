'use client';

import { ReportedIssues } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ReportedIssuesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ReportedIssues />
    </ProtectedRoute>
  );
}
