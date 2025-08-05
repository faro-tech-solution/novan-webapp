'use client';

import { Courses } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CoursesPage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <Courses />
    </ProtectedRoute>
  );
}