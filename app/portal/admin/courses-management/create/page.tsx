'use client';

import { CreateCourse } from "@/components/pages/courses";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateCoursePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateCourse />
    </ProtectedRoute>
  );
}

