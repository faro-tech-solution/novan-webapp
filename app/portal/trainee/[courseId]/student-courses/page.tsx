'use client';

import { StudentCourses } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudentCoursesPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <StudentCourses />
    </ProtectedRoute>
  );
}