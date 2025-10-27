import { supabase } from '@/integrations/supabase/client';
import { Product, CreateProductData, UpdateProductData, ProductFilters, ProductAccessInfo } from '@/types/product';

export const productService = {
  // Get all products (admin view)
  async fetchProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products' as any)
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.product_type) {
      query = query.eq('product_type', filters.product_type);
    }
    if (filters?.access_level) {
      query = query.eq('access_level', filters.access_level);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as Product[];
  },

  // Get public products (filtered by access level and status)
  async fetchPublicProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products' as any)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.product_type) {
      query = query.eq('product_type', filters.product_type);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as Product[];
  },

  // Get featured products for homepage
  async fetchFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products' as any)
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as any[];
  },

  // Get single product by slug
  async fetchProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products' as any)
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    return data as any;
  },

  // Get single product by ID (admin)
  async fetchProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products' as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    return data as any;
  },

  // Create new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data, error } = await supabase
      .from('products' as any)
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Update product
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const { data, error } = await supabase
      .from('products' as any)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Check if slug is unique
  async checkSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('products' as any)
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).length === 0;
  },

  // Generate unique slug from title
  async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 0;

    while (true) {
      const isUnique = await this.checkSlugUnique(slug, excludeId);
      if (isUnique) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  },

  // Check user access to product
  async checkUserAccess(product: Product, userId?: string): Promise<ProductAccessInfo> {
    const { access_level, price } = product;

    switch (access_level) {
      case 'public':
        return { canAccess: true, requiresAuth: false, requiresPayment: false };

      case 'registered':
        if (!userId) {
          return {
            canAccess: false,
            requiresAuth: true,
            requiresPayment: false,
            message: 'برای دسترسی به این محصول باید وارد شوید'
          };
        }
        return { canAccess: true, requiresAuth: false, requiresPayment: false };

      case 'paid':
        if (!userId) {
          return {
            canAccess: false,
            requiresAuth: true,
            requiresPayment: true,
            message: 'برای دسترسی به این محصول باید وارد شوید'
          };
        }
        
        // Check if user has paid for this product
        // This would need to be implemented based on your payment system
        // For now, we'll assume all authenticated users can access paid products
        if (price > 0) {
          // TODO: Implement actual payment verification
          return {
            canAccess: false,
            requiresAuth: false,
            requiresPayment: true,
            message: `برای دسترسی به این محصول باید ${(price / 100).toLocaleString('fa-IR')} تومان پرداخت کنید`
          };
        }
        return { canAccess: true, requiresAuth: false, requiresPayment: false };

      default:
        return { canAccess: false, requiresAuth: false, requiresPayment: false };
    }
  },

  // Get product categories
  async fetchProductCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products' as any)
      .select('category')
      .not('category', 'is', null)
      .eq('status', 'active');

    if (error) throw error;

    const categories = [...new Set((data || []).map((item: any) => item.category).filter(Boolean))];
    return categories.sort();
  },

  // Get product statistics (admin)
  async fetchProductStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    draft: number;
    featured: number;
    byType: Record<string, number>;
    byAccessLevel: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('products' as any)
      .select('status, product_type, access_level, is_featured');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter((p: any) => p.status === 'active').length,
      inactive: data.filter((p: any) => p.status === 'inactive').length,
      draft: data.filter((p: any) => p.status === 'draft').length,
      featured: data.filter((p: any) => p.is_featured).length,
      byType: {} as Record<string, number>,
      byAccessLevel: {} as Record<string, number>
    };

    // Count by type
    data.forEach((product: any) => {
      stats.byType[product.product_type] = (stats.byType[product.product_type] || 0) + 1;
      stats.byAccessLevel[product.access_level] = (stats.byAccessLevel[product.access_level] || 0) + 1;
    });

    return stats;
  }
};
