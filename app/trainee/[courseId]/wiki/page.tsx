'use client';

import { Wiki } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WikiPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <Wiki />
    </ProtectedRoute>
  );
}