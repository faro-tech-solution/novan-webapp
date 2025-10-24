import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductDialog from "@/components/dialogs/ProductDialog";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { Product, ProductFilters } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2, Plus, Search, DollarSign } from "lucide-react";
import Image from "next/image";
import { getProductTypeConfig, getAccessLevelConfig, getStatusConfig, formatPrice, formatFileSize, formatDuration } from '@/constants/productConstants';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.fetchProducts(filters);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("خطا در بارگذاری محصولات");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await productService.deleteProduct(selectedProduct.id);
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت حذف شد",
      });
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      toast({
        title: "خطا",
        description: "خطا در حذف محصول",
        variant: "destructive",
      });
    }
  };

  const handleProductCreated = () => {
    setShowCreateDialog(false);
    loadProducts();
  };

  const handleProductUpdated = () => {
    setShowEditDialog(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.author?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout title="مدیریت محصولات">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت محصولات">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت محصولات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در محصولات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value as any})}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فیلتر وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
                <SelectItem value="draft">پیش‌نویس</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.product_type || 'all'} onValueChange={(value) => setFilters({...filters, product_type: value === 'all' ? undefined : value as any})}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فیلتر نوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                <SelectItem value="video">ویدیو</SelectItem>
                <SelectItem value="audio">صوت</SelectItem>
                <SelectItem value="ebook">کتاب الکترونیکی</SelectItem>
                <SelectItem value="other">سایر</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.access_level || 'all'} onValueChange={(value) => setFilters({...filters, access_level: value === 'all' ? undefined : value as any})}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فیلتر دسترسی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه سطوح</SelectItem>
                <SelectItem value="public">عمومی</SelectItem>
                <SelectItem value="registered">کاربران ثبت‌نام شده</SelectItem>
                <SelectItem value="paid">پولی</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            محصول جدید
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const typeConfig = getProductTypeConfig(product.product_type);
            const accessConfig = getAccessLevelConfig(product.access_level);
            const statusConfig = getStatusConfig(product.status);

            return (
              <Card key={product.id} className="overflow-hidden">
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
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Badge variant="secondary" className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant={accessConfig.variant} className={accessConfig.color}>
                          {accessConfig.label}
                        </Badge>
                        <Badge variant={statusConfig.variant} className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.author && (
                    <p className="text-sm text-gray-600 line-clamp-1">نویسنده: {product.author}</p>
                  )}
                  
                  <div className="space-y-2">
                    {product.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package className="h-4 w-4" />
                        <span>{product.category}</span>
                      </div>
                    )}
                    
                    {product.duration && (product.product_type === 'video' || product.product_type === 'audio') && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>مدت: {formatDuration(product.duration)}</span>
                      </div>
                    )}
                    
                    {product.file_size && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>حجم: {formatFileSize(product.file_size)}</span>
                      </div>
                    )}

                    {product.price > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatPrice(product.price)}</span>
                      </div>
                    )}
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      ویرایش
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">هیچ محصولی یافت نشد</div>
          </div>
        )}
      </div>

      {/* Create/Edit Product Dialogs */}
      <ProductDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        onSuccess={handleProductCreated}
      />

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <ProductDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          mode="edit"
          product={selectedProduct}
          onSuccess={handleProductUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedProduct && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="حذف محصول"
          description={`آیا مطمئن هستید که می‌خواهید محصول "${selectedProduct.title}" را حذف کنید؟`}
          onConfirmDelete={confirmDeleteProduct}
        />
      )}
    </DashboardLayout>
  );
};

export default ProductManagement;
