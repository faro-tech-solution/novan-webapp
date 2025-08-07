'use client';

import { Profile } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <Profile />
    </ProtectedRoute>
  );
}