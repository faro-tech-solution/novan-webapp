'use client';

import { WikiCategory } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WikiCategoryPage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <WikiCategory />
    </ProtectedRoute>
  );
}