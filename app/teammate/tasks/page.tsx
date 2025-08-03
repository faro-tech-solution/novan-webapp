'use client';

import { TeammateTasks } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TeammateTasksPage() {
  return (
    <ProtectedRoute requiredRole="teammate">
      <TeammateTasks />
    </ProtectedRoute>
  );
}