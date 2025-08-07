'use client';

import { ReviewSubmissions } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ReviewSubmissionsPage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <ReviewSubmissions />
    </ProtectedRoute>
  );
}