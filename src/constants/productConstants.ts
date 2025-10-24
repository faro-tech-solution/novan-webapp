import { BadgeProps } from '@/components/ui/badge';
import { ProductType, AccessLevel, ProductStatus } from '@/types/product';

// Product categories
export const PRODUCT_CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Web Development',
  'Machine Learning',
  'Cybersecurity',
  'Cloud Computing',
  'Database',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Product type display names and icons
export const PRODUCT_TYPE_CONFIG = {
  video: {
    label: 'ویدیو',
    icon: 'Video',
    color: 'bg-red-100 text-red-800'
  },
  audio: {
    label: 'صوت',
    icon: 'Music',
    color: 'bg-purple-100 text-purple-800'
  },
  ebook: {
    label: 'کتاب الکترونیکی',
    icon: 'BookOpen',
    color: 'bg-green-100 text-green-800'
  },
  other: {
    label: 'سایر',
    icon: 'File',
    color: 'bg-gray-100 text-gray-800'
  }
} as const;

// Access level display names and badge variants
export const ACCESS_LEVEL_CONFIG = {
  public: {
    label: 'عمومی',
    variant: 'default' as BadgeProps['variant'],
    color: 'bg-green-100 text-green-800'
  },
  registered: {
    label: 'کاربران ثبت‌نام شده',
    variant: 'secondary' as BadgeProps['variant'],
    color: 'bg-blue-100 text-blue-800'
  },
  paid: {
    label: 'پولی',
    variant: 'destructive' as BadgeProps['variant'],
    color: 'bg-yellow-100 text-yellow-800'
  }
} as const;

// Status display names and badge variants
export const STATUS_CONFIG = {
  active: {
    label: 'فعال',
    variant: 'default' as BadgeProps['variant'],
    color: 'bg-green-100 text-green-800'
  },
  inactive: {
    label: 'غیرفعال',
    variant: 'secondary' as BadgeProps['variant'],
    color: 'bg-gray-100 text-gray-800'
  },
  draft: {
    label: 'پیش‌نویس',
    variant: 'outline' as BadgeProps['variant'],
    color: 'bg-orange-100 text-orange-800'
  }
} as const;

// Helper functions
export const getProductTypeConfig = (type: ProductType) => {
  return PRODUCT_TYPE_CONFIG[type];
};

export const getAccessLevelConfig = (level: AccessLevel) => {
  return ACCESS_LEVEL_CONFIG[level];
};

export const getStatusConfig = (status: ProductStatus) => {
  return STATUS_CONFIG[status];
};

export const getProductTypeBadge = (type: ProductType) => {
  const config = getProductTypeConfig(type);
  return {
    variant: 'secondary' as BadgeProps['variant'],
    className: config.color
  };
};

export const getAccessLevelBadge = (level: AccessLevel) => {
  const config = getAccessLevelConfig(level);
  return {
    variant: config.variant,
    className: config.color
  };
};

export const getStatusBadge = (status: ProductStatus) => {
  const config = getStatusConfig(status);
  return {
    variant: config.variant,
    className: config.color
  };
};

// File size formatting
export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'نامشخص';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Duration formatting
export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return 'نامشخص';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Price formatting
export const formatPrice = (price: number): string => {
  if (price === 0) return 'رایگان';
  
  const formattedPrice = (price / 100).toLocaleString('fa-IR');
  return `${formattedPrice} تومان`;
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '') // Keep Persian, Arabic, and alphanumeric
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Check if user can access product
export const checkProductAccess = (
  product: { access_level: AccessLevel; price: number },
  user: { isAuthenticated: boolean; hasPaid?: boolean } | null
): { canAccess: boolean; requiresAuth: boolean; requiresPayment: boolean; message?: string } => {
  const { access_level, price } = product;
  
  switch (access_level) {
    case 'public':
      return { canAccess: true, requiresAuth: false, requiresPayment: false };
    
    case 'registered':
      if (!user?.isAuthenticated) {
        return {
          canAccess: false,
          requiresAuth: true,
          requiresPayment: false,
          message: 'برای دسترسی به این محصول باید وارد شوید'
        };
      }
      return { canAccess: true, requiresAuth: false, requiresPayment: false };
    
    case 'paid':
      if (!user?.isAuthenticated) {
        return {
          canAccess: false,
          requiresAuth: true,
          requiresPayment: true,
          message: 'برای دسترسی به این محصول باید وارد شوید'
        };
      }
      if (price > 0 && !user?.hasPaid) {
        return {
          canAccess: false,
          requiresAuth: false,
          requiresPayment: true,
          message: `برای دسترسی به این محصول باید ${formatPrice(price)} پرداخت کنید`
        };
      }
      return { canAccess: true, requiresAuth: false, requiresPayment: false };
    
    default:
      return { canAccess: false, requiresAuth: false, requiresPayment: false };
  }
};
