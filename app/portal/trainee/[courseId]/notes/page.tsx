'use client';

import NotesPage from "@/components/pages/notes/NotesPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NotesPageRoute() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <NotesPage />
    </ProtectedRoute>
  );
}