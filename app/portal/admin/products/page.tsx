'use client';

import ProductManagement from "@/components/products/ProductManagement";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminProductsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ProductManagement />
    </ProtectedRoute>
  );
}
