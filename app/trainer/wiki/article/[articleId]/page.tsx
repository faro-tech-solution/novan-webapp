'use client';

import { WikiArticle } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WikiArticlePage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <WikiArticle />
    </ProtectedRoute>
  );
}