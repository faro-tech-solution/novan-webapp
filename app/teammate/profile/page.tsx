'use client';

import { Profile } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="teammate">
      <Profile />
    </ProtectedRoute>
  );
}