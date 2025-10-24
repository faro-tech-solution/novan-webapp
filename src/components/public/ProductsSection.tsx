import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load featured products for homepage
      const data = await productService.fetchFeaturedProducts(4);
      setProducts(data);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">در حال بارگذاری محصولات...</div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              محصولات ویژه
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            مجموعه‌ای از بهترین ویدیوها، کتاب‌های الکترونیکی و فایل‌های صوتی ما
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className="bg-white"
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-gray-200 hover:bg-[#6e61b5] hover:text-white text-[#6e61b5] px-8 py-4 rounded-lg">
            <Link href="/products" className="flex items-center gap-2">
              مشاهده همه محصولات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
