import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { formatPrice, formatFileSize, formatDuration } from '@/constants/productConstants';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className = "" }: ProductCardProps) => {
  return (
    <Link href={`/products/${product.slug}`} className="block">
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardHeader className="p-0">
          {product.thumbnail && (
            <div className="relative h-48 w-full">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
                {product.author && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">نویسنده: {product.author}</p>
                )}
              </div>
              {/* <div className="flex flex-col gap-1 shrink-0">
                <Badge variant="secondary" className={typeConfig.color}>
                  {getTypeIcon()}
                  <span className="mr-1">{typeConfig.label}</span>
                </Badge>
                <Badge variant={accessConfig.variant} className={accessConfig.color}>
                  {getAccessIcon()}
                  <span className="mr-1">{accessConfig.label}</span>
                </Badge>
              </div> */}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {product.category && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">دسته‌بندی:</span>
                <span>{product.category}</span>
              </div>
            )}
            
            {product.duration && (product.product_type === 'video' || product.product_type === 'audio') && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">مدت زمان:</span>
                <span>{formatDuration(product.duration)}</span>
              </div>
            )}
            
            {product.file_size && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">حجم فایل:</span>
                <span>{formatFileSize(product.file_size)}</span>
              </div>
            )}
          </div>

          {product.price > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">قیمت:</span>
              <span className="font-semibold text-green-600">{formatPrice(product.price)}</span>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3} بیشتر
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
