export type ProductType = 'video' | 'audio' | 'ebook' | 'other';
export type AccessLevel = 'public' | 'registered' | 'paid';
export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  product_type: ProductType;
  file_url: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  duration: number | null; // Duration in seconds for video/audio
  file_size: number | null; // File size in bytes
  price: number; // Price in cents (0 = free)
  access_level: AccessLevel;
  is_featured: boolean;
  status: ProductStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  title: string;
  slug?: string; // Optional, will be auto-generated if not provided
  description?: string | null;
  thumbnail?: string | null;
  product_type: ProductType;
  file_url?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[];
  duration?: number | null;
  file_size?: number | null;
  price?: number;
  access_level: AccessLevel;
  is_featured?: boolean;
  status: ProductStatus;
  created_by: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductFilters {
  category?: string;
  product_type?: ProductType;
  access_level?: AccessLevel;
  status?: ProductStatus;
  is_featured?: boolean;
  search?: string;
}

export interface ProductAccessInfo {
  canAccess: boolean;
  requiresAuth: boolean;
  requiresPayment: boolean;
  message?: string;
}
