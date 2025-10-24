'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/public/Footer';
import ProductAccessButton from '@/components/products/ProductAccessButton';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, HardDrive, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductTypeConfig, getAccessLevelConfig, formatPrice, formatFileSize, formatDuration } from '@/constants/productConstants';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.fetchProductBySlug(slug);
      if (!data) {
        setError('محصول یافت نشد');
        return;
      }
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری محصول');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">در حال بارگذاری محصول...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'محصول یافت نشد'}
            </h1>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                بازگشت به لیست محصولات
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeConfig = getProductTypeConfig(product.product_type);
  const accessConfig = getAccessLevelConfig(product.access_level);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              بازگشت به لیست محصولات
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Header */}
            <div className="space-y-6">
              {product.thumbnail && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                    {product.author && (
                      <p className="text-lg text-gray-600 mt-2">نویسنده: {product.author}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Badge variant="secondary" className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                    <Badge variant={accessConfig.variant} className={accessConfig.color}>
                      {accessConfig.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {product.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="h-5 w-5" />
                      <span className="font-medium">دسته‌بندی:</span>
                      <span>{product.category}</span>
                    </div>
                  )}
                  
                  {product.duration && (product.product_type === 'video' || product.product_type === 'audio') && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">مدت زمان:</span>
                      <span>{formatDuration(product.duration)}</span>
                    </div>
                  )}
                  
                  {product.file_size && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <HardDrive className="h-5 w-5" />
                      <span className="font-medium">حجم فایل:</span>
                      <span>{formatFileSize(product.file_size)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">درباره محصول</h2>
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">برچسب‌ها</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Access Button */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                دسترسی به محصول
              </h3>
              <p className="text-gray-600 mb-4">
                {product.access_level === 'public' && 'این محصول برای همه قابل دسترسی است'}
                {product.access_level === 'registered' && 'برای دسترسی به این محصول باید وارد شوید'}
                {product.access_level === 'paid' && `برای دسترسی به این محصول باید ${formatPrice(product.price)} پرداخت کنید`}
              </p>
              <ProductAccessButton product={product} size="lg" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                اطلاعات محصول
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع:</span>
                  <Badge variant="secondary" className={typeConfig.color}>
                    {typeConfig.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">دسترسی:</span>
                  <Badge variant={accessConfig.variant} className={accessConfig.color}>
                    {accessConfig.label}
                  </Badge>
                </div>
                {product.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">قیمت:</span>
                    <span className="font-semibold text-green-600">{formatPrice(product.price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">تاریخ ایجاد:</span>
                  <span>{new Date(product.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">دسته‌بندی:</span>
                    <span>{product.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products CTA */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                محصولات دیگر
              </h3>
              <p className="text-gray-600 mb-4">
                از سایر محصولات ما نیز دیدن کنید
              </p>
              <Button asChild variant="outline">
                <Link href="/products">
                  مشاهده همه محصولات
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
