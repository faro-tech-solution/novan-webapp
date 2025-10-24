import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Product, ProductAccessInfo } from '@/types/product';
import { productService } from '@/services/productService';
import { useStableAuth } from '@/hooks/useStableAuth';
import { Download, Lock, LogIn, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ProductAccessButtonProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const ProductAccessButton = ({ product, className = "", size = 'default' }: ProductAccessButtonProps) => {
  const [accessInfo, setAccessInfo] = useState<ProductAccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useStableAuth();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const access = await productService.checkUserAccess(product, user?.id);
        setAccessInfo(access);
      } catch (error) {
        console.error('Error checking product access:', error);
        setAccessInfo({
          canAccess: false,
          requiresAuth: false,
          requiresPayment: false,
          message: 'خطا در بررسی دسترسی'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [product, user?.id]);

  if (loading) {
    return (
      <Button disabled className={className} size={size}>
        در حال بررسی...
      </Button>
    );
  }

  if (!accessInfo) {
    return (
      <Button disabled className={className} size={size}>
        خطا در بررسی دسترسی
      </Button>
    );
  }

  // User can access the product
  if (accessInfo.canAccess) {
    return (
      <Button 
        className={`bg-green-600 hover:bg-green-700 text-white ${className}`} 
        size={size}
        onClick={() => {
          // Handle download/view action
          if (product.file_url) {
            window.open(product.file_url, '_blank');
          }
        }}
      >
        <Download className="h-4 w-4 mr-2" />
        {product.product_type === 'video' ? 'تماشا' : 
         product.product_type === 'audio' ? 'شنیدن' : 'دانلود'}
      </Button>
    );
  }

  // User needs to authenticate
  if (accessInfo.requiresAuth && !user) {
    return (
      <Button asChild className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`} size={size}>
        <Link href="/portal/login">
          <LogIn className="h-4 w-4 mr-2" />
          ورود برای دسترسی
        </Link>
      </Button>
    );
  }

  // User needs to pay
  if (accessInfo.requiresPayment) {
    return (
      <Button 
        className={`bg-yellow-600 hover:bg-yellow-700 text-white ${className}`} 
        size={size}
        onClick={() => {
          // Handle purchase flow
          // This would integrate with your payment system
          alert('سیستم پرداخت در حال توسعه است');
        }}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        خرید ({product.price > 0 ? `${(product.price / 100).toLocaleString('fa-IR')} تومان` : 'رایگان'})
      </Button>
    );
  }

  // Default case - no access
  return (
    <Button disabled className={className} size={size}>
      <Lock className="h-4 w-4 mr-2" />
      دسترسی محدود
    </Button>
  );
};

export default ProductAccessButton;
